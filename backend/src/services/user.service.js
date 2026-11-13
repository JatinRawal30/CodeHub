const { user } = require("../models/user");
const Submission = require("../models/Submission");
const Problem = require("../models/Problem");
const { NotFoundError, BadRequestError } = require("../utils/appError");
const { hashPassword, comparePasswords } = require("../utils/hashing");
const { generateToken } = require("../utils/generateToken");
const redisClient = require("../config/redis.config");
const { changePasswordValidation, updateProfileValidation } = require("../utils/validateReqBody");

class UserService {
    // case-insensitive username/first-name prefix match, for the navbar search box
    async searchUsers(rawQuery) {
        const q = String(rawQuery ?? "").trim().slice(0, 20);
        if (!q) return [];
        // escape so the query is matched literally, never as a user-supplied regex
        const prefix = new RegExp("^" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        // shortcut: case-insensitive regex scans instead of using the username index; add a lowercased indexed field if users grow large
        const users = await user
            .find({ $or: [{ username: prefix }, { firstName: prefix }] })
            .select("username firstName lastName profile.avatar.url problemsSolved")
            .limit(8)
            .lean();
        return users.map((u) => ({
            username: u.username,
            name: [u.firstName, u.lastName].filter(Boolean).join(" "),
            avatar: u.profile?.avatar?.url || null,
            solved: u.problemsSolved?.length ?? 0,
        }));
    }

    // Users ranked by problems solved (the first accepted submission per problem). Admins are left out.
    // period "week" / "month" counts only problems first solved in the last 7 / 30 days.
    // Ties share a rank; inside a tie, more hard problems come first, then whoever got there earlier.
    async getLeaderboard({ period = "all", page = 1, limit = 10, search = "" } = {}, viewerId) {
        const days = { week: 7, month: 30 }[period];
        const since = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;
        const countIf = (difficulty) => ({ $sum: { $cond: [{ $eq: ["$problem.difficulty", difficulty] }, 1, 0] } });

        // shortcut: the whole ranking is rebuilt and ranked in memory on every request;
        // cache it in Redis or precompute it once there are thousands of users
        const ranked = await Submission.aggregate([
            { $match: { verdict: "Accepted" } },
            { $group: { _id: { userId: "$userId", problemId: "$problemId" }, solvedAt: { $min: "$createdAt" } } },
            ...(since ? [{ $match: { solvedAt: { $gte: since } } }] : []),
            {
                $lookup: {
                    from: "problems",
                    localField: "_id.problemId",
                    foreignField: "_id",
                    pipeline: [{ $project: { difficulty: 1 } }],
                    as: "problem",
                },
            },
            { $unwind: "$problem" }, // drops solves of problems that were deleted since
            {
                $group: {
                    _id: "$_id.userId",
                    solved: { $sum: 1 },
                    easy: countIf("easy"),
                    medium: countIf("medium"),
                    hard: countIf("hard"),
                    lastSolvedAt: { $max: "$solvedAt" },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    pipeline: [{ $project: { username: 1, firstName: 1, lastName: 1, "profile.avatar.url": 1, isVerified: 1, role: 1 } }],
                    as: "user",
                },
            },
            { $unwind: "$user" },
            { $match: { "user.role": { $ne: "admin" } } },
            { $sort: { solved: -1, hard: -1, lastSolvedAt: 1, "user.username": 1 } },
        ]);

        // competition ranking: 1, 2, 2, 4
        ranked.forEach((row, i) => {
            row.rank = i > 0 && row.solved === ranked[i - 1].solved ? ranked[i - 1].rank : i + 1;
        });

        const query = String(search ?? "").trim().toLowerCase().slice(0, 20);
        const matches = query ? ranked.filter((row) => row.user.username.toLowerCase().includes(query)) : ranked;

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
        const pageRows = matches.slice((pageNum - 1) * limitNum, pageNum * limitNum);
        const me = ranked.find((row) => String(row._id) === String(viewerId)) || null;

        // acceptance rate and most-used language, only for the users being returned
        const shown = me ? [...pageRows, me] : pageRows;
        const perLanguage = await Submission.aggregate([
            {
                $match: {
                    userId: { $in: shown.map((row) => row._id) },
                    verdict: { $nin: ["Pending", "Internal Error"] }, // never really judged
                    ...(since && { createdAt: { $gte: since } }),
                },
            },
            {
                $group: {
                    _id: { userId: "$userId", language: "$language" },
                    judged: { $sum: 1 },
                    accepted: { $sum: { $cond: [{ $eq: ["$verdict", "Accepted"] }, 1, 0] } },
                },
            },
        ]);
        const statsByUser = new Map();
        for (const { _id, judged, accepted } of perLanguage) {
            const key = String(_id.userId);
            const stats = statsByUser.get(key) || { judged: 0, accepted: 0, topLanguage: null, topAccepted: 0 };
            stats.judged += judged;
            stats.accepted += accepted;
            if (accepted > stats.topAccepted) {
                stats.topAccepted = accepted;
                stats.topLanguage = _id.language;
            }
            statsByUser.set(key, stats);
        }

        const toRow = (row) => {
            const stats = statsByUser.get(String(row._id));
            return {
                rank: row.rank,
                username: row.user.username,
                name: [row.user.firstName, row.user.lastName].filter(Boolean).join(" "),
                avatar: row.user.profile?.avatar?.url || null,
                isVerified: Boolean(row.user.isVerified),
                solved: row.solved,
                easy: row.easy,
                medium: row.medium,
                hard: row.hard,
                // percent with one decimal
                acceptanceRate: stats?.judged ? Math.round((stats.accepted / stats.judged) * 1000) / 10 : null,
                topLanguage: stats?.topLanguage || null,
                lastSolvedAt: row.lastSolvedAt,
            };
        };

        return {
            period: days ? period : "all",
            rows: pageRows.map(toRow),
            me: me ? toRow(me) : null, // null: the viewer is an admin or has no solves in this period
            pagination: {
                currentPage: pageNum,
                totalPages: Math.max(1, Math.ceil(matches.length / limitNum)),
                totalUsers: matches.length,
            },
        };
    }

    // calendar covers the past year, keyed by UTC date
    async getPublicProfile(username) {
        const foundUser = await user
            .findOne({ username })
            .select("firstName lastName username profile isVerified role problemsSolved languagePreferences createdAt");

        if (!foundUser) {
            throw new NotFoundError(`User "${username}" not found`);
        }

        const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        // Pending / Internal Error submissions were never really judged, so they don't count in stats
        const judgedOnly = { $match: { verdict: { $nin: ["Pending", "Internal Error"] } } };

        const [submissionStats, recentAccepted, solvedProblems, problemTotals, usersAhead] = await Promise.all([
            // one pass over the user's submissions, several results ($facet)
            Submission.aggregate([
                { $match: { userId: foundUser._id } },
                {
                    $facet: {
                        verdicts: [
                            judgedOnly,
                            { $group: { _id: "$verdict", count: { $sum: 1 } } },
                        ],
                        // distinct problems accepted, not submissions
                        languageStats: [
                            { $match: { verdict: "Accepted" } },
                            { $group: { _id: { language: "$language", problemId: "$problemId" } } },
                            { $group: { _id: "$_id.language", count: { $sum: 1 } } },
                        ],
                        totals: [
                            judgedOnly,
                            {
                                $group: {
                                    _id: null,
                                    total: { $sum: 1 },
                                    accepted: {
                                        $sum: {
                                            $cond: [{ $eq: ["$verdict", "Accepted"] }, 1, 0],
                                        },
                                    },
                                },
                            },
                        ],
                        // submissions per day, for the heatmap
                        calendar: [
                            { $match: { createdAt: { $gte: oneYearAgo } } },
                            {
                                $group: {
                                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                                    count: { $sum: 1 },
                                },
                            },
                        ],
                    },
                },
            ]),

            Submission.find({ userId: foundUser._id, verdict: "Accepted" })
                .sort({ createdAt: -1 })
                .limit(15)
                .populate("problemId", "problemID title difficulty")
                .select("language createdAt problemId"),

            Problem.find({ _id: { $in: foundUser.problemsSolved } })
                .select("_id problemID title difficulty tags"),

            Problem.aggregate([{ $group: { _id: "$difficulty", count: { $sum: 1 } } }]),

            // rank = 1 + number of users who solved more problems (admins aren't ranked, as on the leaderboard)
            user.countDocuments({
                role: { $ne: "admin" },
                $expr: {
                    $gt: [
                        { $size: { $ifNull: ["$problemsSolved", []] } },
                        foundUser.problemsSolved.length,
                    ],
                },
            }),
        ]);

        const stats = submissionStats[0];
        const totalSubmissions = stats.totals[0]?.total || 0;
        const totalAccepted = stats.totals[0]?.accepted || 0;
        const acceptanceRate =
            totalSubmissions > 0
                ? ((totalAccepted / totalSubmissions) * 100).toFixed(1)
                : "0.0";

        const verdictMap = {};
        for (const v of stats.verdicts) {
            verdictMap[v._id] = v.count;
        }

        const languageMap = {};
        for (const l of stats.languageStats) {
            languageMap[l._id] = l.count;
        }

        // { "2026-10-17": 3, ... }
        const submissionCalendar = {};
        for (const day of stats.calendar) {
            submissionCalendar[day._id] = day.count;
        }

        const breakdown = {
            easy: solvedProblems.filter((p) => p.difficulty === "easy").length,
            medium: solvedProblems.filter((p) => p.difficulty === "medium").length,
            hard: solvedProblems.filter((p) => p.difficulty === "hard").length,
        };
        const totalByDifficulty = { easy: 0, medium: 0, hard: 0 };
        for (const t of problemTotals) {
            totalByDifficulty[t._id] = t.count;
        }

        const tagCounts = {};
        for (const p of solvedProblems) {
            for (const tag of p.tags || []) {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            }
        }
        const tagStats = Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count);

        return {
            username: foundUser.username,
            name: `${foundUser.firstName}${foundUser.lastName ? " " + foundUser.lastName : ""}`,
            avatar: foundUser.profile?.avatar?.url || "",
            bio: foundUser.profile?.bio || "",
            isVerified: foundUser.isVerified,
            role: foundUser.role,
            memberSince: foundUser.createdAt,
            languagePreferences: foundUser.languagePreferences,
            rank: usersAhead + 1,

            solvedStats: {
                totalSolved: solvedProblems.length,
                breakdown,
                totalProblems: totalByDifficulty.easy + totalByDifficulty.medium + totalByDifficulty.hard,
                totalByDifficulty,
            },

            submissionStats: {
                totalSubmissions,
                totalAccepted,
                acceptanceRate: `${acceptanceRate}%`,
                verdicts: {
                    accepted: verdictMap["Accepted"] || 0,
                    wrongAnswer: verdictMap["Wrong Answer"] || 0,
                    timeLimitExceeded: verdictMap["Time Limit Exceeded"] || 0,
                    runtimeError: verdictMap["Runtime Error"] || 0,
                    compilationError: verdictMap["Compilation Error"] || 0,
                },
            },

            languageStats: languageMap,
            tagStats,

            submissionCalendar,
            recentAccepted: recentAccepted.map((s) => ({
                submissionId: s._id,
                problemID: s.problemId?.problemID,
                title: s.problemId?.title,
                difficulty: s.problemId?.difficulty,
                language: s.language,
                solvedAt: s.createdAt,
            })),
        };
    }

    // public profile plus email and the editable fields
    async getMyProfile(userId) {
        const foundUser = await user
            .findById(userId)
            .select("-password");

        if (!foundUser) {
            throw new NotFoundError("User not found");
        }

        const publicData = await this.getPublicProfile(foundUser.username);

        return {
            ...publicData,
            // owner-only fields
            firstName: foundUser.firstName,
            lastName: foundUser.lastName || "",
            email: foundUser.email,
            isActive: foundUser.isActive,
            updatedAt: foundUser.updatedAt,
        };
    }

    // empty lastName removes it. avatar changes only go through avatar.service.js
    async updateMyProfile(userId, body) {
        const validation = updateProfileValidation.safeParse(body);
        if (!validation.success) {
            throw new BadRequestError("Invalid request body", validation.error.issues);
        }
        const { firstName, lastName, bio, languagePreferences } = validation.data;

        const set = {};
        const unset = {};
        if (firstName !== undefined) set.firstName = firstName;
        if (lastName !== undefined) {
            if (lastName === "") unset.lastName = "";
            else set.lastName = lastName;
        }
        if (bio !== undefined) set["profile.bio"] = bio;
        if (languagePreferences !== undefined) {
            set.languagePreferences = [...new Set(languagePreferences)];
        }

        if (Object.keys(set).length === 0 && Object.keys(unset).length === 0) {
            throw new BadRequestError("No valid fields provided to update");
        }

        const update = {};
        if (Object.keys(set).length) update.$set = set;
        if (Object.keys(unset).length) update.$unset = unset;

        const updatedUser = await user
            .findByIdAndUpdate(userId, update, { new: true, runValidators: true })
            .select("-password");

        if (!updatedUser) {
            throw new NotFoundError("User not found");
        }

        return updatedUser;
    }

    // logs out every other session; the current device gets a fresh token pair
    async changePassword(userId, body) {
        const validation = changePasswordValidation.safeParse(body);
        if (!validation.success) {
            throw new BadRequestError("Invalid request body", validation.error.issues);
        }
        const { oldPassword, newPassword } = validation.data;

        // password is excluded by default
        const existingUser = await user.findById(userId).select("+password");
        if (!existingUser) {
            throw new NotFoundError("User not found");
        }

        const isOldPasswordCorrect = await comparePasswords(oldPassword, existingUser.password);
        if (!isOldPasswordCorrect) {
            throw new BadRequestError("Old password is incorrect");
        }

        const isSamePassword = await comparePasswords(newPassword, existingUser.password);
        if (isSamePassword) {
            throw new BadRequestError("New password must be different from the old password");
        }

        existingUser.password = await hashPassword(newPassword);
        await existingUser.save();

        // dropping the refresh token kicks out every other session
        await redisClient.del(`refreshToken:${userId}`);

        const { token: newAccessToken, refreshToken: newRefreshToken } = generateToken({
            id: existingUser._id,
            email: existingUser.email,
            username: existingUser.username,
            role: existingUser.role,
        });

        await redisClient.set(`refreshToken:${userId}`, newRefreshToken, {
            EX: 60 * 60 * 24 * 7,
        });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }

}

module.exports = new UserService();

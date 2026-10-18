const { user } = require("../models/user");
const Submission = require("../models/Submission");
const Problem = require("../models/Problem");
const { NotFoundError, BadRequestError } = require("../utils/appError");
const { hashPassword, comparePasswords } = require("../utils/hashing");
const { generateToken } = require("../utils/generateToken");
const redisClient = require("../config/redis.config");
const { changePasswordValidation, updateProfileValidation } = require("../utils/validateReqBody");

class UserService {
    /**
     * Fetch a rich, LeetCode-style public profile for any user by username.
     * Includes:
     *   - Basic info (username, avatar, bio, member since) and global rank
     *   - Solve statistics (solved vs. total per difficulty)
     *   - Submission activity: total submissions, acceptance rate, verdicts
     *   - Language breakdown (distinct problems solved per language)
     *   - Skills (solved problems per tag)
     *   - Submission calendar for the past year (UTC dates)
     *   - Recent accepted submissions (last 15)
     */
    async getPublicProfile(username) {
        // 1. Fetch user by username
        const foundUser = await user
            .findOne({ username })
            .select("firstName lastName username profile isVerified role problemsSolved languagePreferences createdAt");

        if (!foundUser) {
            throw new NotFoundError(`User "${username}" not found`);
        }

        const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        // Pending / Internal Error submissions were never really judged, so they don't count in stats
        const judgedOnly = { $match: { verdict: { $nin: ["Pending", "Internal Error"] } } };

        // 2. Run all queries in parallel
        const [submissionStats, recentAccepted, solvedProblems, problemTotals, usersAhead] = await Promise.all([
            // 2a. One pass over this user's submissions, several results ($facet)
            Submission.aggregate([
                { $match: { userId: foundUser._id } },
                {
                    $facet: {
                        // Total count per verdict
                        verdicts: [
                            judgedOnly,
                            { $group: { _id: "$verdict", count: { $sum: 1 } } },
                        ],
                        // Distinct problems accepted per language
                        languageStats: [
                            { $match: { verdict: "Accepted" } },
                            { $group: { _id: { language: "$language", problemId: "$problemId" } } },
                            { $group: { _id: "$_id.language", count: { $sum: 1 } } },
                        ],
                        // Overall totals
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
                        // Submissions per day for the heatmap
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

            // 2b. Last 15 accepted submissions with populated problem info
            Submission.find({ userId: foundUser._id, verdict: "Accepted" })
                .sort({ createdAt: -1 })
                .limit(15)
                .populate("problemId", "problemID title difficulty")
                .select("language createdAt problemId"),

            // 2c. Solved problems with difficulty and tags
            Problem.find({ _id: { $in: foundUser.problemsSolved } })
                .select("_id problemID title difficulty tags"),

            // 2d. How many problems exist per difficulty
            Problem.aggregate([{ $group: { _id: "$difficulty", count: { $sum: 1 } } }]),

            // 2e. Rank = 1 + number of users who solved more problems
            user.countDocuments({
                $expr: {
                    $gt: [
                        { $size: { $ifNull: ["$problemsSolved", []] } },
                        foundUser.problemsSolved.length,
                    ],
                },
            }),
        ]);

        // 3. Parse aggregation facets
        const stats = submissionStats[0];
        const totalSubmissions = stats.totals[0]?.total || 0;
        const totalAccepted = stats.totals[0]?.accepted || 0;
        const acceptanceRate =
            totalSubmissions > 0
                ? ((totalAccepted / totalSubmissions) * 100).toFixed(1)
                : "0.0";

        // Build verdict map
        const verdictMap = {};
        for (const v of stats.verdicts) {
            verdictMap[v._id] = v.count;
        }

        // Build language map
        const languageMap = {};
        for (const l of stats.languageStats) {
            languageMap[l._id] = l.count;
        }

        // Build calendar map { "2026-10-17": 3, ... }
        const submissionCalendar = {};
        for (const day of stats.calendar) {
            submissionCalendar[day._id] = day.count;
        }

        // 4. Difficulty breakdown: solved vs. total
        const breakdown = {
            easy: solvedProblems.filter((p) => p.difficulty === "easy").length,
            medium: solvedProblems.filter((p) => p.difficulty === "medium").length,
            hard: solvedProblems.filter((p) => p.difficulty === "hard").length,
        };
        const totalByDifficulty = { easy: 0, medium: 0, hard: 0 };
        for (const t of problemTotals) {
            totalByDifficulty[t._id] = t.count;
        }

        // 5. Skills: solved problems per tag, most practised first
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
            // --- Identity ---
            username: foundUser.username,
            name: `${foundUser.firstName}${foundUser.lastName ? " " + foundUser.lastName : ""}`,
            avatar: foundUser.profile?.avatar,
            bio: foundUser.profile?.bio || "",
            isVerified: foundUser.isVerified,
            role: foundUser.role,
            memberSince: foundUser.createdAt,
            languagePreferences: foundUser.languagePreferences,
            rank: usersAhead + 1,

            // --- Solve Stats ---
            solvedStats: {
                totalSolved: solvedProblems.length,
                breakdown,
                totalProblems: totalByDifficulty.easy + totalByDifficulty.medium + totalByDifficulty.hard,
                totalByDifficulty,
            },

            // --- Submission Stats ---
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

            // --- Language Breakdown & Skills ---
            languageStats: languageMap,
            tagStats,

            // --- Activity ---
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

    /**
     * Fetch the full private profile for the currently logged-in user.
     * Includes everything in the public profile PLUS email and editable fields.
     */
    async getMyProfile(userId) {
        const foundUser = await user
            .findById(userId)
            .select("-password");

        if (!foundUser) {
            throw new NotFoundError("User not found");
        }

        // Reuse getPublicProfile data by username
        const publicData = await this.getPublicProfile(foundUser.username);

        return {
            ...publicData,
            // Private extras only visible to the owner
            firstName: foundUser.firstName,
            lastName: foundUser.lastName || "",
            email: foundUser.email,
            isActive: foundUser.isActive,
            updatedAt: foundUser.updatedAt,
        };
    }

    /**
     * Update the logged-in user's editable profile fields.
     * Empty lastName / avatar remove the value (avatar falls back to the default image).
     */
    async updateMyProfile(userId, body) {
        const validation = updateProfileValidation.safeParse(body);
        if (!validation.success) {
            throw new BadRequestError("Invalid request body", validation.error.issues);
        }
        const { firstName, lastName, bio, avatar, languagePreferences } = validation.data;

        const set = {};
        const unset = {};
        if (firstName !== undefined) set.firstName = firstName;
        if (lastName !== undefined) {
            if (lastName === "") unset.lastName = "";
            else set.lastName = lastName;
        }
        if (bio !== undefined) set["profile.bio"] = bio;
        if (avatar !== undefined) {
            if (avatar === "") unset["profile.avatar"] = "";
            else set["profile.avatar"] = avatar;
        }
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

    /**
     * Change the logged-in user's password.
     * - Validates the request body with Zod.
     * - Verifies the old password against the DB hash.
     * - Hashes and saves the new password.
     * - Invalidates ALL existing sessions (deletes refresh token from Redis).
     * - Issues a fresh token pair so the current device stays logged in.
     */
    async changePassword(userId, body) {
        // 1. Validate request body (oldPassword, newPassword, confirmPassword)
        const validation = changePasswordValidation.safeParse(body);
        if (!validation.success) {
            throw new BadRequestError("Invalid request body", validation.error.issues);
        }
        const { oldPassword, newPassword } = validation.data;

        // 2. Fetch user WITH password field (normally excluded by default)
        const existingUser = await user.findById(userId).select("+password");
        if (!existingUser) {
            throw new NotFoundError("User not found");
        }

        // 3. Verify the old password is correct
        const isOldPasswordCorrect = await comparePasswords(oldPassword, existingUser.password);
        if (!isOldPasswordCorrect) {
            throw new BadRequestError("Old password is incorrect");
        }

        // 4. Prevent re-using the same password
        const isSamePassword = await comparePasswords(newPassword, existingUser.password);
        if (isSamePassword) {
            throw new BadRequestError("New password must be different from the old password");
        }

        // 5. Hash and save the new password
        existingUser.password = await hashPassword(newPassword);
        await existingUser.save();

        // 6. Invalidate ALL active sessions by deleting refresh token from Redis
        //    This kicks out any attacker or stale session on other devices.
        await redisClient.del(`refreshToken:${userId}`);

        // 7. Issue a fresh token pair so THIS device stays logged in seamlessly
        const { token: newAccessToken, refreshToken: newRefreshToken } = generateToken({
            id: existingUser._id,
            email: existingUser.email,
            username: existingUser.username,
            role: existingUser.role,
        });

        // 8. Store the new refresh token in Redis (7-day expiry)
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

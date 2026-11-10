const mongoose = require("mongoose");
const Problem = require("../models/Problem");
const { user } = require("../models/user");
const {
    createProblemValidation,
    updateProblemValidation,
} = require("../utils/validateReqBody");
const {
    BadRequestError,
    NotFoundError,
    ConflictError,
} = require("../utils/appError");

class ProblemService {
    // id can be a 24-char ObjectId or the numeric problemID
    getProblemQuery(id) {
        if (!id) return null;
        if (mongoose.isValidObjectId(id)) {
            return { _id: id };
        }
        const numericId = Number(id);
        if (!isNaN(numericId)) {
            return { problemID: numericId };
        }
        return null;
    }

    // admin only
    async createProblem(payload, creatorId) {
        const validation = createProblemValidation.safeParse(payload);
        if (!validation.success) {
            throw new BadRequestError("Invalid request body", validation.error.issues);
        }

        const problemData = validation.data;

        const existingProblem = await Problem.findOne({ problemID: problemData.problemID });
        if (existingProblem) {
            throw new ConflictError(`Problem with ID ${problemData.problemID} already exists`);
        }

        const problem = await Problem.create({
            ...problemData,
            problemCreator: creatorId,
        });

        return problem;
    }

    // admin only
    async updateProblem(id, payload) {
        const query = this.getProblemQuery(id);
        if (!query) {
            throw new BadRequestError("Invalid problem identifier");
        }

        const validation = updateProblemValidation.safeParse(payload);
        if (!validation.success) {
            throw new BadRequestError("Invalid request body", validation.error.issues);
        }

        const updates = validation.data;
        if (Object.keys(updates).length === 0) {
            throw new BadRequestError("No valid fields provided to update");
        }

        const problem = await Problem.findOneAndUpdate(query, updates, {
            new: true,
            runValidators: true,
        });

        if (!problem) {
            throw new NotFoundError("Problem not found");
        }

        return problem;
    }

    // admin only
    async deleteProblem(id) {
        const query = this.getProblemQuery(id);
        if (!query) {
            throw new BadRequestError("Invalid problem identifier");
        }

        const problem = await Problem.findOneAndDelete(query);
        if (!problem) {
            throw new NotFoundError("Problem not found");
        }

        return problem;
    }

    // leaves out hidden test cases and the reference solution
    async getProblemById(id) {
        const query = this.getProblemQuery(id);
        if (!query) {
            throw new BadRequestError("Invalid problem identifier");
        }

        const problem = await Problem.findOne(query).select(
            "-hiddenTestCases -referenceSolution -referenceSolutions"
        );

        if (!problem) {
            throw new NotFoundError("Problem not found");
        }

        return problem;
    }

    async getAllProblems({ difficulty, tags, page = 1, limit = 10, search }) {
        const filter = {};

        if (difficulty) {
            filter.difficulty = difficulty;
        }

        if (tags) {
            filter.tags = { $in: tags.split(",") };
        }

        if (typeof search === "string" && search.trim()) {
            const escaped = search.trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.title = { $regex: escaped, $options: "i" };
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, parseInt(limit, 10) || 10);
        const skip = (pageNum - 1) * limitNum;

        const [problems, total] = await Promise.all([
            Problem.find(filter)
                .select("_id problemID title difficulty tags")
                .sort({ problemID: 1 })
                .skip(skip)
                .limit(limitNum),
            Problem.countDocuments(filter),
        ]);

        return {
            problems,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalProblems: total,
            },
        };
    }

    async getUserProblems(userId) {
        const problems = await Problem.find({ problemCreator: userId })
            .select("_id problemID title difficulty tags")
            .sort({ problemID: 1 });

        return {
            totalProblems: problems.length,
            problems,
        };
    }

    // includes a per-difficulty breakdown
    async getSolvedProblems(userId) {
        const currentUser = await user.findById(userId).select("problemsSolved");
        if (!currentUser) {
            throw new NotFoundError("User not found");
        }

        const solvedProblemIds = currentUser.problemsSolved || [];

        const solvedProblems = await Problem.find({
            _id: { $in: solvedProblemIds },
        })
            .select("_id problemID title difficulty tags")
            .sort({ problemID: 1 });

        const breakdown = {
            easy: solvedProblems.filter((p) => p.difficulty === "easy").length,
            medium: solvedProblems.filter((p) => p.difficulty === "medium").length,
            hard: solvedProblems.filter((p) => p.difficulty === "hard").length,
        };

        return {
            totalSolved: solvedProblems.length,
            breakdown,
            solvedProblems,
        };
    }
}

module.exports = new ProblemService();

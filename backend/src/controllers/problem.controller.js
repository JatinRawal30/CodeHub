const problemService = require("../services/problem.service");

// CREATE: Admin creates a new problem
async function createProblem(req, res) {
    try {
        const problem = await problemService.createProblem(req.body, req.user.id);

        return res.status(201).json({
            message: "Problem created successfully",
            problem,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            error: error.message,
            ...(error.details && { details: error.details }),
        });
    }
}

// UPDATE: Admin updates a problem
async function updateProblem(req, res) {
    try {
        const { id } = req.params;
        const problem = await problemService.updateProblem(id, req.body);

        return res.status(200).json({
            message: "Problem updated successfully",
            problem,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            error: error.message,
            ...(error.details && { details: error.details }),
        });
    }
}

// DELETE: Admin deletes a problem
async function deleteProblem(req, res) {
    try {
        const { id } = req.params;
        const problem = await problemService.deleteProblem(id);

        return res.status(200).json({
            message: "Problem deleted successfully",
            deletedProblem: problem.title,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}

// GET BY ID: Get a single problem
async function getProblemByID(req, res) {
    try {
        const { id } = req.params;
        const problem = await problemService.getProblemById(id);

        return res.status(200).json({ problem });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}

// GET ALL: List all problems with optional filters and pagination
async function getAllProblems(req, res) {
    try {
        const { difficulty, tags, page, limit, search } = req.query;
        const result = await problemService.getAllProblems({
            difficulty,
            tags,
            page,
            limit,
            search,
        });

        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}

// GET USER PROBLEMS: Get problems created by logged-in admin
async function getUserProblem(req, res) {
    try {
        const result = await problemService.getUserProblems(req.user.id);

        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}

// GET SOLVED PROBLEMS: Get all problems solved by logged-in user
async function getSolvedProblems(req, res) {
    try {
        const result = await problemService.getSolvedProblems(req.user.id);

        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}

module.exports = {
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemByID,
    getAllProblems,
    getUserProblem,
    getSolvedProblems,
};
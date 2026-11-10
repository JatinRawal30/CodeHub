const problemService = require("../services/problem.service");

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

// problems created by the logged-in admin
async function getUserProblem(req, res) {
    try {
        const result = await problemService.getUserProblems(req.user.id);

        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}

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
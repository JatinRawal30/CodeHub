const executionService = require("../services/execution.service");

// Visible test cases only; nothing is saved
async function runCode(req, res) {
    try {
        const result = await executionService.runCode(req.body);

        if (result.isCompilationError) {
            return res.status(200).json({
                status: result.status,
                error: result.error,
            });
        }

        return res.status(200).json({
            totalTests: result.totalTests,
            passed: result.passed,
            results: result.results,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            error: error.message,
            ...(error.details && { details: error.details }),
        });
    }
}

// Saves a Pending submission and queues the judge job. Returns 202; client polls /result/:submissionId
async function submitCode(req, res) {
    try {
        const result = await executionService.submitCode(req.body, req.user.id);

        return res.status(202).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            error: error.message,
            ...(error.details && { details: error.details }),
        });
    }
}

async function getUserSubmissionsForProblem(req, res) {
    try {
        const userId = req.user.id;
        const problemIdentifier = req.params.pId || req.params.problemId || req.params.id;

        const result = await executionService.getUserSubmissions(userId, problemIdentifier);

        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}

// Stays Pending until the worker finishes
async function getSubmissionResult(req, res) {
    try {
        const submission = await executionService.getSubmissionResult(req.params.submissionId, req.user.id);

        return res.status(200).json(submission);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}

module.exports = {
    runCode,
    submitCode,
    getUserSubmissionsForProblem,
    getSubmissionResult,
};

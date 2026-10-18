const executionService = require("../services/execution.service");

// RUN: Execute against visible test cases in batch mode (no DB save)
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

// SUBMIT: Write "Pending" + enqueue judge job -> 202 with submissionId (poll /result/:submissionId)
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

// GET SUBMISSIONS: Fetch all submissions by authenticated user for a specific problem (newest first)
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

// GET RESULT: Current verdict of one submission (Pending until the worker finishes)
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

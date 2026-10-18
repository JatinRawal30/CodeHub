const express = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const { runCode, submitCode, getUserSubmissionsForProblem, getSubmissionResult } = require('../controllers/execution.controller');
const { runCodeLimiter, submitCodeLimiter } = require('../middleware/rateLimiter.middleware');

const executionRouter = express.Router();

// Require authenticated user
executionRouter.post('/run', authMiddleware, runCodeLimiter, runCode);
executionRouter.post('/submit', authMiddleware, submitCodeLimiter, submitCode);
executionRouter.get('/submissions/:pId', authMiddleware, getUserSubmissionsForProblem);
executionRouter.get('/result/:submissionId', authMiddleware, getSubmissionResult);

module.exports = executionRouter;

const express = require('express');
const { adminAuthMiddleware, authMiddleware } = require('../middleware/auth.middleware');
const {
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemByID,
    getAllProblems,
    getUserProblem,
    getSolvedProblems,
} = require('../controllers/problem.controller');
const { getUserSubmissionsForProblem } = require('../controllers/execution.controller');

const problemRouter = express.Router();

// Authenticated user routes (must be defined BEFORE dynamic /:id routes)
problemRouter.get('/user', authMiddleware, getUserProblem);
problemRouter.get('/solved', authMiddleware, getSolvedProblems);

// General problem collection routes
problemRouter.post('/', adminAuthMiddleware, createProblem);
problemRouter.post('/create', adminAuthMiddleware, createProblem); // backward-compatible alias

problemRouter.get('/', getAllProblems);
problemRouter.get('/list', getAllProblems); // backward-compatible alias

// Single problem resource routes (supports either MongoDB _id or numeric problemID)
problemRouter.get('/:id/submissions', authMiddleware, getUserSubmissionsForProblem);
problemRouter.get('/:id', getProblemByID);
problemRouter.get('/get/:id', getProblemByID); // backward-compatible alias

problemRouter.patch('/:id', adminAuthMiddleware, updateProblem);
problemRouter.patch('/update/:id', adminAuthMiddleware, updateProblem); // backward-compatible alias

problemRouter.delete('/:id', adminAuthMiddleware, deleteProblem);
problemRouter.delete('/delete/:id', adminAuthMiddleware, deleteProblem); // backward-compatible alias

module.exports = problemRouter;

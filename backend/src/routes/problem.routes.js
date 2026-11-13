const express = require('express');
const { adminAuthMiddleware, authMiddleware } = require('../middleware/auth.middleware');
const {
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemByID,
    getFullProblem,
    getAllProblems,
    getTagCounts,
    getUserProblem,
    getSolvedProblems,
} = require('../controllers/problem.controller');
const { getUserSubmissionsForProblem } = require('../controllers/execution.controller');

const problemRouter = express.Router();

// must come before the /:id routes
problemRouter.get('/user', authMiddleware, getUserProblem);
problemRouter.get('/solved', authMiddleware, getSolvedProblems);
problemRouter.get('/tag-counts', getTagCounts);

problemRouter.post('/', adminAuthMiddleware, createProblem);

problemRouter.get('/', getAllProblems);

// :id is either a Mongo _id or the numeric problemID
problemRouter.get('/:id/submissions', authMiddleware, getUserSubmissionsForProblem);
problemRouter.get('/:id/full', adminAuthMiddleware, getFullProblem);
problemRouter.get('/:id', getProblemByID);

problemRouter.patch('/:id', adminAuthMiddleware, updateProblem);

problemRouter.delete('/:id', adminAuthMiddleware, deleteProblem);

module.exports = problemRouter;

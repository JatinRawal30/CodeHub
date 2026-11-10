const mongoose = require("mongoose");
const { executeBatch } = require("../utils/pistonApi");
const Problem = require("../models/Problem");
const Submission = require("../models/Submission");
const { user } = require("../models/user");
const { executionValidation } = require("../utils/validateReqBody");
const { BadRequestError, NotFoundError } = require("../utils/appError");
const { submissionQueue } = require("../queues/submission.queue");

class ExecutionService {
    // accepts either an ObjectId or the numeric problemID (1, 2, ...)
    async resolveProblem(problemIdentifier) {
        if (!problemIdentifier) {
            throw new BadRequestError("Problem identifier is required");
        }

        if (mongoose.isValidObjectId(problemIdentifier)) {
            const problem = await Problem.findById(problemIdentifier);
            if (problem) return problem;
        }

        const numericId = Number(problemIdentifier);
        if (!isNaN(numericId)) {
            const problem = await Problem.findOne({ problemID: numericId });
            if (problem) return problem;
        }

        throw new NotFoundError("Problem not found");
    }

    async resolveProblemId(problemIdentifier) {
        const problem = await this.resolveProblem(problemIdentifier);
        return problem._id;
    }

    // visible test cases only, nothing is saved
    async runCode(payload) {
        const validation = executionValidation.safeParse(payload);
        if (!validation.success) {
            throw new BadRequestError("Invalid request body", validation.error.issues);
        }

        const { problemId, language, code } = validation.data;

        const problem = await this.resolveProblem(problemId);

        const testCases = problem.visibleTestCases || [];
        const inputs = testCases.map((tc) => tc.input);

        const batchResults = await executeBatch(
            language,
            code,
            inputs,
            problem.timeLimit || 2.0,
            problem.memoryLimit || 256
        );

        // Judge0 status 6 = Compilation Error
        const compError = batchResults.find((r) => r.statusId === 6);
        if (compError) {
            return {
                isCompilationError: true,
                status: "Compilation Error",
                error: compError.compileOutput || compError.stderr,
            };
        }

        const results = batchResults.map((resp, i) => {
            const expectedOutput = (testCases[i].output || "").trim();
            const actualOutput = (resp.stdout || "").trim();

            if (resp.statusId === 5) {
                return {
                    input: testCases[i].input,
                    expectedOutput,
                    actualOutput: null,
                    passed: false,
                    status: "Time Limit Exceeded",
                    time: resp.time,
                    memory: resp.memory,
                };
            }

            if (resp.statusId >= 7 || (resp.stderr && !resp.stdout)) {
                return {
                    input: testCases[i].input,
                    expectedOutput,
                    actualOutput: actualOutput || null,
                    passed: false,
                    stderr: resp.stderr,
                    status: "Runtime Error",
                    time: resp.time,
                    memory: resp.memory,
                };
            }

            const passed = actualOutput === expectedOutput;
            return {
                input: testCases[i].input,
                expectedOutput,
                actualOutput,
                passed,
                stderr: resp.stderr || null,
                status: passed ? "Passed" : "Wrong Answer",
                time: resp.time,
                memory: resp.memory,
            };
        });

        return {
            isCompilationError: false,
            totalTests: results.length,
            passed: results.filter((r) => r.passed).length,
            results,
        };
    }

    // saves a Pending submission and queues it; the worker fills in the verdict later (judgeSubmission)
    async submitCode(payload, userId) {
        const validation = executionValidation.safeParse(payload);
        if (!validation.success) {
            throw new BadRequestError("Invalid request body", validation.error.issues);
        }

        const { problemId, language, code } = validation.data;
        const problem = await this.resolveProblem(problemId);

        // save before queueing: the worker loads the submission by id
        const submission = await Submission.create({
            userId,
            problemId: problem._id,
            language,
            code,
            verdict: "Pending",
            totalTestCases: problem.visibleTestCases.length + problem.hiddenTestCases.length,
        });

        // jobId = submissionId, so the same submission is never queued twice
        const submissionId = submission._id.toString();
        try {
            await submissionQueue.add("judge", { submissionId }, { jobId: submissionId });
        } catch (queueError) {
            submission.verdict = "Internal Error";
            submission.errorMessage = "Could not queue submission, please retry";
            await submission.save();
            throw queueError;
        }

        return {
            submissionId,
            verdict: submission.verdict,
            totalTestCases: submission.totalTestCases,
        };
    }

    // called by the submission worker. Judge0/network errors are rethrown so BullMQ retries the job.
    async judgeSubmission(submissionId) {
        const submission = await Submission.findById(submissionId);

        // already judged, e.g. a retry after the result was saved
        if (!submission || submission.verdict !== "Pending") {
            return;
        }

        const problem = await Problem.findById(submission.problemId);
        if (!problem) {
            submission.verdict = "Internal Error";
            submission.errorMessage = "Problem no longer exists";
            await submission.save();
            return;
        }

        const allTestCases = [
            ...problem.visibleTestCases,
            ...problem.hiddenTestCases,
        ];
        const inputs = allTestCases.map((tc) => tc.input);

        const batchResults = await executeBatch(
            submission.language,
            submission.code,
            inputs,
            problem.timeLimit || 2.0,
            problem.memoryLimit || 256
        );

        let testCasesPassed = 0;
        let verdict = "Accepted";
        let errorMessage = null;
        let maxTime = 0;
        let maxMemory = 0;

        for (let i = 0; i < batchResults.length; i++) {
            const resp = batchResults[i];
            const testCase = allTestCases[i];

            if (resp.time) maxTime = Math.max(maxTime, resp.time);
            if (resp.memory) maxMemory = Math.max(maxMemory, resp.memory);

            // Judge0 status ids: 5 = TLE, 6 = compile error, 7+ = runtime errors
            if (resp.statusId === 6) {
                verdict = "Compilation Error";
                errorMessage = resp.compileOutput || resp.stderr;
                break;
            }

            if (resp.statusId === 5) {
                if (verdict === "Accepted") {
                    verdict = "Time Limit Exceeded";
                    errorMessage = `Execution exceeded time limit of ${problem.timeLimit || 2.0}s`;
                }
                continue;
            }

            if (resp.statusId >= 7 || (resp.stderr && !resp.stdout)) {
                if (verdict === "Accepted") {
                    verdict = "Runtime Error";
                    errorMessage = resp.stderr;
                }
                continue;
            }

            const actualOutput = (resp.stdout || "").trim();
            const expectedOutput = (testCase.output || "").trim();

            if (actualOutput === expectedOutput) {
                testCasesPassed++;
            } else if (verdict === "Accepted") {
                verdict = "Wrong Answer";
            }
        }

        submission.verdict = verdict;
        submission.testCasesPassed = testCasesPassed;
        submission.totalTestCases = allTestCases.length;
        submission.executionTime = maxTime;
        submission.memory = maxMemory;
        submission.errorMessage = errorMessage;
        await submission.save();

        if (verdict === "Accepted") {
            await user.findByIdAndUpdate(submission.userId, {
                $addToSet: { problemsSolved: problem._id },
            });
        }
    }

    // only the owner can see it
    async getSubmissionResult(submissionId, userId) {
        if (!mongoose.isValidObjectId(submissionId)) {
            throw new BadRequestError("Invalid submission id");
        }

        const submission = await Submission.findOne({ _id: submissionId, userId }).select(
            "problemId language verdict testCasesPassed totalTestCases executionTime memory errorMessage createdAt"
        );

        if (!submission) {
            throw new NotFoundError("Submission not found");
        }

        return submission;
    }

    async getUserSubmissions(userId, problemIdentifier) {
        const targetProblemId = await this.resolveProblemId(problemIdentifier);

        const submissions = await Submission.find({
            userId,
            problemId: targetProblemId,
        })
            .sort({ createdAt: -1 })
            .select(
                "language verdict testCasesPassed totalTestCases executionTime memory code errorMessage createdAt"
            );

        return {
            totalSubmissions: submissions.length,
            submissions,
        };
    }
}

module.exports = new ExecutionService();

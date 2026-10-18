const { Worker } = require("bullmq");
const { bullConnection } = require("../config/bullmq.config");
const { SUBMISSION_QUEUE_NAME } = require("../queues/submission.queue");
const executionService = require("../services/execution.service");
const Submission = require("../models/Submission");

const WORKER_CONCURRENCY = 2; // at most 2 submissions judged at once (free Redis + public Judge0)

function startSubmissionWorker() {
    const worker = new Worker(
        SUBMISSION_QUEUE_NAME,
        async (job) => executionService.judgeSubmission(job.data.submissionId),
        { connection: bullConnection, concurrency: WORKER_CONCURRENCY }
    );

    // All retries used up -> stop showing "Pending" forever
    worker.on("failed", async (job, err) => {
        if (!job || job.attemptsMade < (job.opts.attempts || 1)) return;

        console.error(`Submission ${job.data.submissionId} failed after ${job.attemptsMade} attempts:`, err.message);
        try {
            await Submission.updateOne(
                { _id: job.data.submissionId, verdict: "Pending" },
                { verdict: "Internal Error", errorMessage: "Judge unavailable, please resubmit" }
            );
        } catch (dbError) {
            console.error("Could not mark submission as Internal Error:", dbError.message);
        }
    });

    worker.on("error", (err) => console.error("Submission worker error:", err.message));

    return worker;
}

module.exports = { startSubmissionWorker };

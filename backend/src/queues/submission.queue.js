const { Queue } = require("bullmq");
const { bullConnection } = require("../config/bullmq.config");

const SUBMISSION_QUEUE_NAME = "submissions";

const submissionQueue = new Queue(SUBMISSION_QUEUE_NAME, {
    connection: bullConnection,
    defaultJobOptions: {
        attempts: 3,                                    // retry Judge0 failures
        backoff: { type: "exponential", delay: 2000 },  // 2s, 4s, 8s
        removeOnComplete: { count: 100 },               // keep Redis small (free plan)
        removeOnFail: { count: 100 },
    },
});

module.exports = {
    SUBMISSION_QUEUE_NAME,
    submissionQueue,
};

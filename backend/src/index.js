require("dotenv").config(); // must run first so every config file sees process.env
const express = require('express');
const mongoose = require('mongoose');
const dbConnect = require('./config/databaseConnect');
const cookieParser = require('cookie-parser');
const authRoute = require("./routes/auth.routes")
const problemRouter = require("./routes/problem.routes")
const executionRouter = require("./routes/execution.routes")
const redisClient = require("./config/redis.config");
const userRouter = require("./routes/user.routes");
const { submissionQueue } = require("./queues/submission.queue");
const { startSubmissionWorker } = require("./workers/submission.worker");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use("/api/auth", authRoute);
app.use("/api/problems", problemRouter);
app.use("/api/execution", executionRouter);
app.use("/api/user", userRouter);

const connection = async () => {
    try {
        await Promise.all([dbConnect(), redisClient.connect()])
        console.log("Connected to both database and redis");

        // Judges queued submissions in this same process (fine for a small user base)
        const worker = startSubmissionWorker();
        console.log("Submission worker started");

        const server = app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        })

        // Graceful shutdown: stop taking requests, let the worker finish its current job, close connections
        let shuttingDown = false;
        const shutdown = async (signal) => {
            if (shuttingDown) return;
            shuttingDown = true;
            console.log(`${signal} received, shutting down...`);
            try {
                server.close();
                await worker.close();
                await submissionQueue.close();
                await redisClient.quit();
                await mongoose.disconnect();
                process.exit(0);
            } catch (error) {
                console.log("Error during shutdown: ", error.message);
                process.exit(1);
            }
        };
        process.on("SIGTERM", () => shutdown("SIGTERM")); // sent by hosting platforms on deploy
        process.on("SIGINT", () => shutdown("SIGINT"));   // Ctrl+C
    }
    catch (error) {
        console.log("Error in connecting to database or redis: ", error.message);
        process.exit(1);
    }
}
connection();

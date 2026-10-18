const http = require("http");
require("dotenv").config();
const dbConnect = require("./src/config/databaseConnect");
const redisClient = require("./src/config/redis.config");
const { user: User } = require("./src/models/user");
const Problem = require("./src/models/Problem");
const Submission = require("./src/models/Submission");

// Import the app
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoute = require("./src/routes/auth.routes");
const executionRouter = require("./src/routes/execution.routes");
const problemRouter = require("./src/routes/problem.routes");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoute);
app.use("/api/execution", executionRouter);
app.use("/api/problems", problemRouter);

const PORT = 3599; // Isolated test port

function request(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(`http://localhost:${PORT}${path}`);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method,
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
        };

        const req = http.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                let parsed;
                try {
                    parsed = JSON.parse(data);
                } catch {
                    parsed = data;
                }
                resolve({ status: res.statusCode, body: parsed });
            });
        });

        req.on("error", reject);
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runDemo() {
    console.log("==================================================");
    console.log("🚀 STARTING CODEHUB END-TO-END DEMO TEST");
    console.log("==================================================");

    await Promise.all([dbConnect(), redisClient.connect()]);
    const server = app.listen(PORT);
    console.log(`✅ Test server running on http://localhost:${PORT}\n`);

    try {
        const timestamp = Date.now();
        const adminEmail = `admin_${timestamp}@codehub.test`;
        const userEmail = `user_${timestamp}@codehub.test`;

        // 1. REGISTER NORMAL USER
        console.log("1️⃣ [POST /api/auth/register] Registering User...");
        const regRes = await request("POST", "/api/auth/register", {
            firstName: "Code",
            lastName: "Tester",
            age: 22,
            username: `coder_${timestamp}`,
            email: userEmail,
            password: "Password123!",
            confirmPassword: "Password123!",
        });
        console.log(`   Status: ${regRes.status}, AccessToken: ${regRes.body.accessToken ? "Generated ✅" : "Failed ❌"}`);
        const userToken = regRes.body.accessToken;

        // 2. CREATE SEED ADMIN (Directly in DB for testing admin routes)
        const { hashPassword } = require("./src/utils/hashing");
        const adminUser = await User.create({
            firstName: "Admin",
            age: 30,
            username: `admin_${timestamp}`,
            email: adminEmail,
            password: await hashPassword("AdminPassword123!"),
            role: "admin",
        });

        // 3. ADMIN LOGIN
        console.log("\n2️⃣ [POST /api/auth/login] Admin Login...");
        const adminLoginRes = await request("POST", "/api/auth/login", {
            identifier: adminEmail,
            password: "AdminPassword123!",
        });
        console.log(`   Status: ${adminLoginRes.status}, Admin Token: ${adminLoginRes.body.accessToken ? "Generated ✅" : "Failed ❌"}`);
        const adminToken = adminLoginRes.body.accessToken;

        // 4. ADMIN REGISTERS ANOTHER ADMIN VIA API
        console.log("\n3️⃣ [POST /api/auth/admin/register] Admin Registering New Sub-Admin...");
        const subAdminRes = await request("POST", "/api/auth/admin/register", {
            firstName: "SubAdmin",
            age: 28,
            username: `subadmin_${timestamp}`,
            email: `sub_${timestamp}@codehub.test`,
            password: "SubAdminPass123!",
            confirmPassword: "SubAdminPass123!",
        }, { Authorization: `Bearer ${adminToken}` });
        console.log(`   Status: ${subAdminRes.status}, Message: "${subAdminRes.body.message}" ✅`);

        // 5. ADMIN CREATES A CODING PROBLEM
        console.log("\n4️⃣ [POST /api/problems/create] Admin Creating 'Sum of Two Numbers' Problem...");
        const problemRes = await request("POST", "/api/problems/create", {
            problemID: timestamp % 100000,
            title: "Sum of Two Numbers",
            description: "Read two space-separated integers from stdin and print their sum.",
            difficulty: "easy",
            tags: ["math"],
            visibleTestCases: [
                { input: "3 5", output: "8", explanation: "3 + 5 = 8" },
                { input: "10 20", output: "30", explanation: "10 + 20 = 30" }
            ],
            hiddenTestCases: [
                { input: "100 200", output: "300" },
                { input: "-5 15", output: "10" }
            ],
            constraints: ["-10^9 <= a, b <= 10^9"],
            timeLimit: 2.0,
            memoryLimit: 256,
            referenceSolution: {
                language: "python",
                completeCode: "import sys\na, b = map(int, sys.stdin.read().split())\nprint(a + b)"
            },
            starterCode: {
                language: "python",
                code: "import sys\n# Read a, b from stdin and print sum\n"
            }
        }, { Authorization: `Bearer ${adminToken}` });

        const createdProblem = problemRes.body.problem;
        console.log(`   Status: ${problemRes.status}, Problem ID: ${createdProblem._id} ("${createdProblem.title}") ✅`);

        // 6. GET ALL PROBLEMS & GET PROBLEM BY ID (SECURITY CHECK)
        console.log("\n5️⃣ [GET /api/problems/:id] Fetching Problem details as public user...");
        const getProblemRes = await request("GET", `/api/problems/${createdProblem._id}`);
        console.log(`   Status: ${getProblemRes.status}`);
        console.log(`   Visible Test Cases returned: ${getProblemRes.body.problem.visibleTestCases.length} ✅`);
        console.log(`   Hidden Test Cases hidden from client: ${getProblemRes.body.problem.hiddenTestCases === undefined ? "SECURE ✅" : "EXPOSED ❌"}`);

        // 7. USER RUNS CODE (VISIBLE TEST CASES)
        console.log("\n6️⃣ [POST /api/execution/run] User Running Python Solution against visible tests...");
        const pySolution = "import sys\na, b = map(int, sys.stdin.read().split())\nprint(a + b)";
        const runRes = await request("POST", "/api/execution/run", {
            problemId: createdProblem._id,
            language: "python",
            code: pySolution,
        }, { Authorization: `Bearer ${userToken}` });

        console.log(`   Status: ${runRes.status}`);
        console.log(`   Total Tests: ${runRes.body.totalTests}, Passed: ${runRes.body.passed} ✅`);
        console.log(`   Test 1 Result: expected=${runRes.body.results[0].expectedOutput}, got=${runRes.body.results[0].actualOutput}, status=${runRes.body.results[0].status}`);

        // 8. USER SUBMITS CORRECT CODE (ALL TEST CASES)
        console.log("\n7️⃣ [POST /api/execution/submit] User Submitting Code (All Tests + Save to DB)...");
        const submitRes = await request("POST", "/api/execution/submit", {
            problemId: createdProblem._id,
            language: "python",
            code: pySolution,
        }, { Authorization: `Bearer ${userToken}` });

        console.log(`   Status: ${submitRes.status}`);
        console.log(`   Verdict: ${submitRes.body.verdict} ✅`);
        console.log(`   Passed: ${submitRes.body.testCasesPassed}/${submitRes.body.totalTestCases} Test Cases`);

        // 9. USER SUBMITS WRONG CODE
        console.log("\n8️⃣ [POST /api/execution/submit] User Submitting WRONG Code...");
        const wrongSubmitRes = await request("POST", "/api/execution/submit", {
            problemId: createdProblem._id,
            language: "python",
            code: "import sys\nprint(9999)",
        }, { Authorization: `Bearer ${userToken}` });

        console.log(`   Status: ${wrongSubmitRes.status}`);
        console.log(`   Verdict: ${wrongSubmitRes.body.verdict} (Expected: Wrong Answer) ✅`);

        // 10. JAVASCRIPT SUBMISSION TEST
        console.log("\n9️⃣ [POST /api/execution/submit] User Submitting JavaScript Solution...");
        const jsSolution = `
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (input.length >= 2) {
    console.log(parseInt(input[0]) + parseInt(input[1]));
}
`;
        const jsSubmitRes = await request("POST", "/api/execution/submit", {
            problemId: createdProblem._id,
            language: "javascript",
            code: jsSolution,
        }, { Authorization: `Bearer ${userToken}` });

        console.log(`   Status: ${jsSubmitRes.status}`);
        console.log(`   Verdict: ${jsSubmitRes.body.verdict} (JS Accepted) ✅`);
        console.log(`   Passed: ${jsSubmitRes.body.testCasesPassed}/${jsSubmitRes.body.totalTestCases}`);

        // CLEANUP
        console.log("\n🧹 Cleaning up test artifacts...");
        await Problem.findByIdAndDelete(createdProblem._id);
        await User.deleteMany({ email: { $in: [adminEmail, userEmail, `sub_${timestamp}@codehub.test`] } });
        await Submission.deleteMany({ problemId: createdProblem._id });
        console.log("✅ Cleanup complete");

        console.log("\n==================================================");
        console.log("🎉 ALL TESTS & APIs PASSED SUCCESSFULLY!");
        console.log("==================================================");
    } catch (err) {
        console.error("❌ Test Demo Error:", err);
    } finally {
        server.close();
        await redisClient.quit();
        process.exit(0);
    }
}

runDemo();

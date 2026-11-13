// Seeds demo users with a believable solving history, so the leaderboard, profiles and heatmaps have data.
// Also creates the shared demo account (see src/utils/demoAccount.js) used by "Try the demo" on the login page.
// Seeded accounts are the ones whose email ends in @seed.codehub.dev; real accounts are never touched.
// Submissions are fake: verdicts are made up and nothing is judged.
//
// Run from backend/ after seeding problems:
//   node scripts/seedUsers.js --dry-run   shows what would be created, writes nothing
//   node scripts/seedUsers.js             replaces all seeded users and their submissions with a fresh set
//   node scripts/seedUsers.js --remove    deletes all seeded users and their submissions
require("dotenv").config();
const crypto = require("crypto");
const mongoose = require("mongoose");
const Problem = require("../src/models/Problem");
const Submission = require("../src/models/Submission");
const { user } = require("../src/models/user");
const { hashPassword } = require("../src/utils/hashing");
const { DEMO_USERNAME, DEMO_PASSWORD, SEED_EMAIL_DOMAIN } = require("../src/utils/demoAccount");

const DRY_RUN = process.argv.includes("--dry-run");
const REMOVE = process.argv.includes("--remove");
const DAY = 24 * 60 * 60 * 1000;

// [firstName, lastName]; names need 3+ letters to pass the user schema
const PEOPLE = [
    ["Ishaan", "Verma"], ["Meera", "Nair"], ["Kabir", "Shah"], ["Ananya", "Rao"], ["Rohan", "Das"],
    ["Sara", "Khan"], ["Vikram", "Joshi"], ["Tara", "Menon"], ["Dev", "Patel"], ["Nisha", "Iyer"],
    ["Arjun", "Sen"], ["Pooja", "Gill"], ["Yash", "Bose"], ["Riya", "Dutta"], ["Omkar", "Kulkarni"],
    ["Lina", "Thomas"], ["Neil", "Roy"], ["Zoya", "Ali"], ["Hari", "Pillai"], ["Mira", "Shetty"],
    ["Ravi", "Anand"], ["Uma", "Reddy"], ["Aditi", "Mehra"], ["Karan", "Malhotra"], ["Sneha", "Kapoor"],
    ["Farhan", "Qureshi"], ["Ishita", "Ghosh"], ["Nikhil", "Saxena"], ["Priya", "Chandra"],
];
const BIOS = [
    "Backend dev. Graphs on weekends.", "Learning DP one problem at a time.", "CS student, competitive programming fan.",
    "Preparing for interviews.", "", "", "Python by day, C++ by night.", "Two pointers enthusiast.",
];
const LANGUAGE_WEIGHTS = [["cpp", 40], ["python", 30], ["java", 15], ["javascript", 10], ["c", 5]];
const DIFFICULTY_WEIGHT = { easy: 3, medium: 2, hard: 1 }; // people solve more easy problems
const FAILED_VERDICTS = [["Wrong Answer", 60], ["Time Limit Exceeded", 20], ["Runtime Error", 15], ["Compilation Error", 5]];

// deterministic RNG (mulberry32) so every run produces the same users
let rngState = 20261113;
const random = () => {
    rngState = (rngState + 0x6d2b79f5) | 0;
    let t = Math.imul(rngState ^ (rngState >>> 15), 1 | rngState);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const int = (lo, hi) => lo + Math.floor(random() * (hi - lo + 1));
const weighted = (pairs) => {
    let roll = random() * pairs.reduce((sum, [, w]) => sum + w, 0);
    for (const [value, w] of pairs) if ((roll -= w) < 0) return value;
    return pairs[pairs.length - 1][0];
};

// `count` problems without repeats, weighted towards easy ones
function pickProblems(problems, count) {
    const pool = [...problems];
    const picked = [];
    while (picked.length < count && pool.length) {
        const index = weighted(pool.map((p, i) => [i, DIFFICULTY_WEIGHT[p.difficulty] || 1]));
        picked.push(pool.splice(index, 1)[0]);
    }
    return picked;
}

function makeSubmission({ userId, problem, language, verdict, at }) {
    const total = 10;
    const isAccepted = verdict === "Accepted";
    return {
        _id: new mongoose.Types.ObjectId(),
        userId,
        problemId: problem._id,
        language,
        code: "// Seeded demo submission: no code was judged.",
        verdict,
        testCasesPassed: isAccepted ? total : verdict === "Compilation Error" ? 0 : int(0, total - 1),
        totalTestCases: total,
        executionTime: verdict === "Compilation Error" ? 0 : Math.round((0.01 + random() * 0.4) * 1000) / 1000,
        memory: verdict === "Compilation Error" ? 0 : int(2000, 60000),
        errorMessage: verdict === "Compilation Error" ? "error: expected ';' before '}' token" : undefined,
        createdAt: at,
        updatedAt: at,
    };
}

// One person's account and history. `solvedCount` problems are solved between joining and last activity.
function buildPerson({ firstName, lastName, username, solvedCount, problems, passwordHash, isDemo }) {
    const userId = new mongoose.Types.ObjectId();
    const now = Date.now();
    const joinedAt = new Date(now - int(60, 300) * DAY);
    // most people were active recently, so the 7-day and 30-day boards have entries too
    const lastActive = now - (isDemo || random() < 0.7 ? int(0, 25) : int(30, 59)) * DAY - int(0, 20) * 3600 * 1000;
    const span = lastActive - joinedAt.getTime();

    const primary = weighted(LANGUAGE_WEIGHTS);
    const language = () => (random() < 0.8 ? primary : weighted(LANGUAGE_WEIGHTS));
    const submissions = [];
    const solved = [];

    const toSolve = pickProblems(problems, solvedCount);
    toSolve.forEach((problem, i) => {
        // spread the solves out, with the last one on the last active day
        const solvedAt = joinedAt.getTime() + (i === toSolve.length - 1 ? span : random() * span);
        const lang = language();
        for (let attempt = int(0, 3); attempt > 0; attempt--) {
            submissions.push(makeSubmission({ userId, problem, language: lang, verdict: weighted(FAILED_VERDICTS), at: new Date(solvedAt - attempt * int(2, 20) * 60 * 1000) }));
        }
        submissions.push(makeSubmission({ userId, problem, language: lang, verdict: "Accepted", at: new Date(solvedAt) }));
        solved.push({ id: problem._id, at: solvedAt });
    });

    // a few problems they tried and gave up on
    const solvedIds = new Set(toSolve.map((p) => String(p._id)));
    const unsolved = problems.filter((p) => !solvedIds.has(String(p._id)));
    for (const problem of pickProblems(unsolved, int(0, 4))) {
        for (let attempt = int(1, 3); attempt > 0; attempt--) {
            submissions.push(makeSubmission({ userId, problem, language: language(), verdict: weighted(FAILED_VERDICTS), at: new Date(joinedAt.getTime() + random() * span) }));
        }
    }

    const account = {
        _id: userId,
        firstName,
        lastName,
        username,
        email: `${username}@${SEED_EMAIL_DOMAIN}`,
        password: passwordHash,
        role: "user",
        isVerified: isDemo || random() < 0.6,
        isActive: true,
        problemsSolved: solved.sort((a, b) => a.at - b.at).map((s) => s.id),
        languagePreferences: [primary],
        profile: { bio: isDemo ? "The shared demo account. Sign up to get your own." : BIOS[int(0, BIOS.length - 1)] },
        createdAt: joinedAt,
        updatedAt: joinedAt,
    };
    return { account, submissions };
}

const seedFilter = { email: { $regex: `@${SEED_EMAIL_DOMAIN.replace(/\./g, "\\.")}$` } };

async function removeSeeded() {
    const seeded = await user.find(seedFilter, "_id").lean();
    const ids = seeded.map((u) => u._id);
    const subs = await Submission.deleteMany({ userId: { $in: ids } });
    await user.deleteMany({ _id: { $in: ids } });
    return { users: ids.length, submissions: subs.deletedCount };
}

(async () => {
    await mongoose.connect(process.env.DB_URI);

    if (REMOVE) {
        const removed = await removeSeeded();
        console.log(`Removed ${removed.users} seeded users and ${removed.submissions} of their submissions.`);
        return;
    }

    const problems = await Problem.find({}, "_id difficulty").lean();
    if (problems.length < 10) throw new Error("Seed the problems first (scripts/seedProblems.js)");

    // other users are random, so they get a random password nobody knows
    const [demoHash, otherHash] = await Promise.all([hashPassword(DEMO_PASSWORD), hashPassword(crypto.randomBytes(24).toString("hex"))]);

    // solved counts fall off from the top, so the board has a real spread
    const people = PEOPLE.map(([firstName, lastName], i) => {
        const solvedCount = Math.max(1, Math.round(problems.length * 0.8 * (1 - i / PEOPLE.length) ** 1.6) + int(-3, 3));
        const username = `${firstName}_${lastName}`.toLowerCase().slice(0, 20);
        return buildPerson({ firstName, lastName, username, solvedCount, problems, passwordHash: otherHash, isDemo: false });
    });
    // the demo account sits mid-table, so a visitor sees people above and below them
    people.push(buildPerson({ firstName: "Demo", lastName: "User", username: DEMO_USERNAME, solvedCount: Math.round(problems.length * 0.28), problems, passwordHash: demoHash, isDemo: true }));

    const accounts = people.map((p) => p.account);
    const submissions = people.flatMap((p) => p.submissions);

    // never take over a real account's username
    const clash = await user.find({ username: { $in: accounts.map((a) => a.username) }, email: { $not: seedFilter.email } }, "username").lean();
    if (clash.length) throw new Error(`These usernames belong to real accounts: ${clash.map((c) => c.username).join(", ")}`);

    // the schemas' own validation, before anything is written
    for (const account of accounts) await new user(account).validate();
    for (const submission of submissions) await new Submission(submission).validate();

    // self-check: every accepted problem is in problemsSolved, and nothing else is
    for (const { account, submissions: own } of people) {
        const accepted = new Set(own.filter((s) => s.verdict === "Accepted").map((s) => String(s.problemId)));
        const listed = new Set(account.problemsSolved.map(String));
        if (accepted.size !== listed.size || [...accepted].some((id) => !listed.has(id))) throw new Error(`${account.username}: solved list doesn't match submissions`);
    }

    const solvedCounts = accounts.map((a) => a.problemsSolved.length);
    console.log(`Users: ${accounts.length} (including "${DEMO_USERNAME}"), submissions: ${submissions.length}`);
    console.log(`Solved per user: ${Math.max(...solvedCounts)} down to ${Math.min(...solvedCounts)}; "${DEMO_USERNAME}" has ${accounts[accounts.length - 1].problemsSolved.length}`);

    if (DRY_RUN) {
        const existing = await user.countDocuments(seedFilter);
        console.log(`Dry run: nothing written. A real run replaces the ${existing} seeded users already in the database.`);
        return;
    }

    const removed = await removeSeeded();
    // the native driver keeps the createdAt dates; Mongoose would overwrite them with "now"
    await user.collection.insertMany(accounts);
    await Submission.collection.insertMany(submissions);
    console.log(`Replaced ${removed.users} old seeded users. Demo login: ${DEMO_USERNAME} / ${DEMO_PASSWORD}`);
})()
    .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());

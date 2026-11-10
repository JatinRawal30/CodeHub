// Seeds the practice problems defined in scripts/seed/problems/*.js.
// Expected outputs are computed by each problem's solve(), so tests can't hold a wrong answer.
// Problems whose title already exists are skipped, so re-running is safe.
// Run from backend/:  node scripts/seedProblems.js --dry-run   (checks everything, writes nothing)
//                     node scripts/seedProblems.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const mongoose = require("mongoose");
const Problem = require("../src/models/Problem");
const { user } = require("../src/models/user");
const problemService = require("../src/services/problem.service");
const { createProblemValidation } = require("../src/utils/validateReqBody");

const PROBLEMS_DIR = path.join(__dirname, "seed", "problems");
const HIDDEN = 8;
const MAX_INPUT = 200_000; // chars per test: all tests go to Judge0 in a single batch request
const MAX_OUTPUT = 100_000;
const DRY_RUN = process.argv.includes("--dry-run");

// Same template the frontend falls back to; other languages use FALLBACK_TEMPLATES there.
const STARTER_CPP = `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Read input from stdin and print the answer to stdout

    return 0;
}
`;

// Deterministic RNG (mulberry32) seeded from the title, so every run generates the same tests.
function makeRng(seedText) {
    let a = 0;
    for (const ch of seedText) a = (Math.imul(a, 31) + ch.charCodeAt(0)) | 0;
    const next = () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const r = {
        int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
        pick: (arr) => arr[Math.floor(next() * arr.length)],
        chance: (p) => next() < p,
        shuffle: (arr) => {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(next() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        },
        ints: (n, lo, hi) => Array.from({ length: n }, () => r.int(lo, hi)),
        str: (n, alphabet = "abcdefghijklmnopqrstuvwxyz") =>
            Array.from({ length: n }, () => r.pick(alphabet)).join(""),
    };
    return r;
}

// The stored reference solution is solve()'s own source, so solve must not use anything outside its body.
function referenceProgram(solve) {
    return `const solve = ${solve.toString()};\n\nprocess.stdout.write(String(solve(require("fs").readFileSync(0, "utf8"))) + "\\n");\n`;
}

function runIsolated(solve, input) {
    return String(vm.runInNewContext(`(${solve.toString()})(input)`, { input }, { timeout: 20000 }));
}

function build(p) {
    const r = makeRng(p.title);
    const inputs = new Set((p.edge || []).filter((input) => !p.examples.some((e) => e.input === input)));
    const need = HIDDEN - inputs.size;
    for (let k = 0, tries = 0; inputs.size < HIDDEN && tries < 200; tries++) {
        const before = inputs.size;
        inputs.add(p.generate(r, k >= need - 2)); // the last two generated tests are the large ones
        if (inputs.size > before) k++;
    }

    return {
        title: p.title,
        description: p.description.trim(),
        difficulty: p.difficulty,
        tags: p.tags,
        constraints: p.constraints,
        timeLimit: p.timeLimit ?? 2,
        memoryLimit: 256,
        visibleTestCases: p.examples.map(({ input, explanation }) => ({
            input,
            output: String(p.solve(input)),
            explanation,
        })),
        hiddenTestCases: [...inputs].map((input) => ({ input, output: String(p.solve(input)) })),
        referenceSolution: { language: "javascript", completeCode: referenceProgram(p.solve) },
        starterCode: { language: "cpp", code: STARTER_CPP },
    };
}

async function check(doc, p) {
    const problems = [];
    const tests = [...doc.visibleTestCases, ...doc.hiddenTestCases];
    if (doc.hiddenTestCases.length < 3) problems.push(`only ${doc.hiddenTestCases.length} distinct hidden tests`);
    for (const [i, tc] of tests.entries()) {
        if (tc.input.length > MAX_INPUT) problems.push(`test ${i} input too large (${tc.input.length})`);
        if (!tc.output.trim()) problems.push(`test ${i} has empty output`);
        if (tc.output.length > MAX_OUTPUT) problems.push(`test ${i} output too large (${tc.output.length})`);
        if (/undefined|NaN|\[object/.test(tc.output)) problems.push(`test ${i} output looks broken: ${tc.output.slice(0, 50)}`);
        if (runIsolated(p.solve, tc.input) !== tc.output) problems.push(`test ${i}: solve() is not self-contained or not deterministic`);
    }
    for (const tc of doc.visibleTestCases) {
        if (!tc.explanation) problems.push("visible test case needs an explanation");
    }

    const zod = createProblemValidation.safeParse({ ...doc, problemID: 1 });
    if (!zod.success) problems.push(...zod.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`));
    try {
        await new Problem({ ...doc, problemID: 1, problemCreator: new mongoose.Types.ObjectId() }).validate();
    } catch (error) {
        problems.push(error.message);
    }

    return problems;
}

(async () => {
    // files load in alphabetical order, which fixes the order IDs are assigned in
    const defs = fs.readdirSync(PROBLEMS_DIR).sort().flatMap((f) => require(path.join(PROBLEMS_DIR, f)));
    const docs = [];
    let failed = 0;
    for (const p of defs) {
        try {
            const doc = build(p);
            const problems = await check(doc, p);
            if (problems.length) {
                failed++;
                console.error(`✗ ${p.title}\n    ${problems.join("\n    ")}`);
            }
            docs.push(doc);
        } catch (error) {
            failed++;
            console.error(`✗ ${p.title}: ${error.stack}`);
        }
    }

    const titles = docs.map((d) => d.title);
    const duplicates = titles.filter((t, i) => titles.indexOf(t) !== i);
    if (duplicates.length) {
        failed++;
        console.error(`✗ duplicate titles: ${duplicates.join(", ")}`);
    }

    const count = (key) => docs.reduce((acc, d) => {
        for (const v of [].concat(d[key])) acc[v] = (acc[v] || 0) + 1;
        return acc;
    }, {});
    console.log(`Problems: ${docs.length}`, count("difficulty"));
    console.log("Tags:", count("tags"));
    if (failed) throw new Error(`${failed} problem(s) failed checks; nothing was written`);

    await mongoose.connect(process.env.DB_URI);
    const existing = new Set((await Problem.find({}, "title")).map((p) => p.title));
    const toInsert = docs.filter((d) => !existing.has(d.title));
    const last = await Problem.findOne({}, "problemID").sort({ problemID: -1 });
    let nextId = (last?.problemID || 0) + 1;

    console.log(`Already in DB (skipped): ${docs.length - toInsert.length}`);
    if (DRY_RUN) {
        console.log(`Dry run: would insert ${toInsert.length} problems as IDs ${nextId}-${nextId + toInsert.length - 1}`);
    } else {
        const admin = await user.findOne({ role: "admin" });
        if (!admin) throw new Error("No admin user found; problems need a problemCreator");
        for (const doc of toInsert) {
            await problemService.createProblem({ ...doc, problemID: nextId }, admin._id);
            console.log(`+ ${nextId} ${doc.title}`);
            nextId++;
        }
        console.log(`Inserted ${toInsert.length} problems`);
    }
    await mongoose.disconnect();
})().catch(async (error) => {
    console.error(error.message);
    await mongoose.disconnect();
    process.exit(1);
});

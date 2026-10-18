// Judge0 Community Edition (Free Public API)
const LANGUAGE_MAP = {
    "javascript": 102, // Node.js 22.08.0
    "python": 100,     // Python 3.12.5
    "java": 91,        // Java JDK 17.0.6
    "cpp": 105,        // C++ GCC 14.1.0
    "c": 103,          // C GCC 14.1.0
};

const JUDGE0_BASE_URL = "https://ce.judge0.com";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Execute multiple test cases in parallel using Judge0 Batch Submission API
 * @param {string} language - Language key ("javascript", "python", "cpp", "c", "java")
 * @param {string} code - Source code to execute
 * @param {string[]} inputs - Array of stdin input strings for each test case
 * @param {number} timeLimit - Time limit in seconds
 * @param {number} memoryLimit - Memory limit in MB
 * @returns {Promise<Array<object>>} - Array of execution results
 */
async function executeBatch(language, code, inputs = [], timeLimit = 2.0, memoryLimit = 256) {
    const languageId = LANGUAGE_MAP[language];
    if (!languageId) {
        throw new Error(`Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_MAP).join(", ")}`);
    }

    if (!inputs || inputs.length === 0) {
        return [];
    }

    // 1. Prepare Batch Submissions Payload
    const submissionsPayload = {
        submissions: inputs.map((stdin) => ({
            language_id: languageId,
            source_code: code,
            stdin: stdin || "",
            cpu_time_limit: timeLimit,
            memory_limit: memoryLimit * 1024, // Convert MB to KB
        })),
    };

    // 2. Submit Batch to Judge0
    const postResponse = await fetch(`${JUDGE0_BASE_URL}/submissions/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionsPayload),
    });

    if (!postResponse.ok) {
        throw new Error(`Batch submission error: ${postResponse.status} ${postResponse.statusText}`);
    }

    const tokenObjects = await postResponse.json(); // returns [{token: "abc"}, {token: "def"}, ...]
    const tokens = tokenObjects.map((item) => item.token);  // returns ["abc", "def", ...]

    if (!tokens || tokens.length === 0) {
        throw new Error("No submission tokens returned from Judge0");
    }

    const tokensQuery = tokens.join(","); // returns "abc,def"

    // 3. Poll for Results (Status ID 1 = In Queue, 2 = Processing)
    const MAX_ATTEMPTS = 15;
    const POLL_INTERVAL = 1000; // 1 second

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        await sleep(POLL_INTERVAL);

        const getResponse = await fetch(
            `${JUDGE0_BASE_URL}/submissions/batch?tokens=${tokensQuery}&base64_encoded=false`
        );

        if (!getResponse.ok) {
            throw new Error(`Batch fetch error: ${getResponse.status} ${getResponse.statusText}`);
        }
        const data = await getResponse.json();
        const results = data.submissions || [];

        // Check if all test cases have finished processing (status > 2)
        const isComplete = results.every(
            (res) => res && res.status && res.status.id > 2
        );

        if (isComplete) {
            return results.map((data) => ({
                stdout: data.stdout || "",
                stderr: data.stderr || "",
                compileOutput: data.compile_output || "",
                time: data.time ? parseFloat(data.time) : 0,
                memory: data.memory || 0,
                statusId: data.status ? data.status.id : 0,
                statusDescription: data.status ? data.status.description : "Unknown",
            }));
        }
    }

    throw new Error("Batch execution timed out while waiting for Judge0 results");
}

/**
 * Execute single code snippet (wrapper around executeBatch for convenience)
 */
async function executeCode(language, code, stdin = "", timeLimit = 2.0, memoryLimit = 256) {
    const results = await executeBatch(language, code, [stdin], timeLimit, memoryLimit);
    return results[0] || {
        stdout: "",
        stderr: "No result returned",
        compileOutput: "",
        time: 0,
        memory: 0,
        statusId: 0,
        statusDescription: "Unknown",
    };
}

function getSupportedLanguages() {
    return Object.keys(LANGUAGE_MAP);
}

module.exports = {
    executeBatch,
    executeCode,
    getSupportedLanguages,
    LANGUAGE_MAP,
};

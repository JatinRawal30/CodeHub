// Judge0 CE language ids (free public instance)
const LANGUAGE_MAP = {
    "javascript": 102, // Node.js 22.08.0
    "python": 100,     // Python 3.12.5
    "java": 91,        // Java JDK 17.0.6
    "cpp": 105,        // C++ GCC 14.1.0
    "c": 103,          // C GCC 14.1.0
};

const JUDGE0_BASE_URL = "https://ce.judge0.com";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// one Judge0 submission per input, sent as a single batch. timeLimit is in seconds, memoryLimit in MB
async function executeBatch(language, code, inputs = [], timeLimit = 2.0, memoryLimit = 256) {
    const languageId = LANGUAGE_MAP[language];
    if (!languageId) {
        throw new Error(`Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_MAP).join(", ")}`);
    }

    if (!inputs || inputs.length === 0) {
        return [];
    }

    const submissionsPayload = {
        submissions: inputs.map((stdin) => ({
            language_id: languageId,
            source_code: code,
            stdin: stdin || "",
            cpu_time_limit: timeLimit,
            memory_limit: memoryLimit * 1024, // Judge0 wants KB
        })),
    };

    const postResponse = await fetch(`${JUDGE0_BASE_URL}/submissions/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionsPayload),
    });

    if (!postResponse.ok) {
        throw new Error(`Batch submission error: ${postResponse.status} ${postResponse.statusText}`);
    }

    const tokenObjects = await postResponse.json();
    const tokens = tokenObjects.map((item) => item.token);

    if (!tokens || tokens.length === 0) {
        throw new Error("No submission tokens returned from Judge0");
    }

    const tokensQuery = tokens.join(",");

    // status 1 = In Queue, 2 = Processing; anything higher is finished
    const MAX_ATTEMPTS = 15;
    const POLL_INTERVAL = 1000;

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

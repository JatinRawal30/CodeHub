import api from "./axios";

// Pull the most useful error text out of an API error
export function getApiErrorMessage(err, fallback = "Something went wrong") {
  return (
    err.response?.data?.details?.[0]?.message ||
    err.response?.data?.error ||
    err.response?.data?.message ||
    fallback
  );
}

export async function fetchProblem(problemId) {
  const res = await api.get(`/problems/${problemId}`);
  return res.data.problem;
}

export async function fetchSubmissions(problemId) {
  const res = await api.get(`/problems/${problemId}/submissions`);
  return res.data.submissions || [];
}

// Runs against the visible test cases only; nothing is saved
export async function runCode({ problemId, language, code }) {
  const res = await api.post("/execution/run", { problemId, language, code });
  return res.data;
}

// Queues a submission; returns { submissionId, verdict: "Pending", totalTestCases }
export async function submitCode({ problemId, language, code }) {
  const res = await api.post("/execution/submit", { problemId, language, code });
  return res.data;
}

// Poll the judge until the verdict is no longer "Pending"
export async function waitForVerdict(submissionId, { intervalMs = 1000, maxAttempts = 45, isCancelled = () => false } = {}) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    if (isCancelled()) return null;

    const res = await api.get(`/execution/result/${submissionId}`);
    if (res.data.verdict !== "Pending") return res.data;
  }
  throw new Error("Judging is taking longer than usual. Check the Submissions tab in a moment.");
}

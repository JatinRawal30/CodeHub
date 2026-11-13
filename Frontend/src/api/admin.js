import api from "./axios";

// Everything about a problem, including hidden test cases and reference solutions
export async function fetchFullProblem(problemId) {
  const res = await api.get(`/problems/${problemId}/full`);
  return res.data.problem;
}

export async function createProblem(problem) {
  const res = await api.post("/problems", problem);
  return res.data.problem;
}

// `changes` holds only the fields to change
export async function updateProblem(problemId, changes) {
  const res = await api.patch(`/problems/${problemId}`, changes);
  return res.data.problem;
}

export async function deleteProblem(problemId) {
  await api.delete(`/problems/${problemId}`);
}

export async function registerAdmin(account) {
  const res = await api.post("/auth/admin/register", account);
  return res.data.admin;
}

// Problem IDs are picked by the admin; suggest one past the highest in use (the list is sorted by ID)
export async function fetchNextProblemId() {
  const first = await api.get("/problems", { params: { limit: 1 } });
  const total = first.data.pagination?.totalProblems || 0;
  if (!total) return 1;
  const last = await api.get("/problems", { params: { limit: 1, page: total } });
  return (last.data.problems?.[0]?.problemID || total) + 1;
}

// Puts the backend's validation issues ({ path, message }) on the matching form fields.
// `toFieldName` maps a backend path to the form's field name when they differ.
// Returns false when the error carried no field issues.
export function applyServerErrors(err, setError, toFieldName = (name) => name) {
  const issues = err.response?.data?.details;
  if (!Array.isArray(issues) || issues.length === 0) return false;
  issues.forEach((issue, i) => {
    // focus the first one so the admin lands on the problem
    setError(toFieldName(issue.path.join(".")), { type: "server", message: issue.message }, { shouldFocus: i === 0 });
  });
  return true;
}

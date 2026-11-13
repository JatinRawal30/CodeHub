export function formatMemory(kb) {
  if (!kb) return "—";
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

export function formatRuntime(seconds) {
  if (!seconds) return "—";
  return `${Math.round(seconds * 1000)} ms`;
}

// Must match TAG_ENUM in backend/src/utils/validateReqBody.js
export const PROBLEM_TAGS = [
  "arrays", "strings", "dynamic programming", "trees", "graphs",
  "linked list", "hash table", "sorting", "searching", "recursion",
  "backtracking", "heaps", "tries", "geometry", "math",
  "two pointers", "sliding window", "stack", "queue", "special",
];

export const DIFFICULTIES = ["easy", "medium", "hard"];

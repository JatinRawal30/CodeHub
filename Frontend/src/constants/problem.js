export const DIFFICULTY_COLORS = {
  easy: "text-[#5fb39f]",
  medium: "text-[#d6b45f]",
  hard: "text-[#d47470]",
};

export const DIFFICULTY_BADGES = {
  easy: "text-[#5fb39f] bg-[#5fb39f]/10",
  medium: "text-[#d6b45f] bg-[#d6b45f]/10",
  hard: "text-[#d47470] bg-[#d47470]/10",
};

// Text color for a verdict / test status
export function verdictColor(verdict) {
  if (verdict === "Accepted" || verdict === "Passed") return "text-[#68b582]";
  if (verdict === "Pending") return "text-[#e2a24a]";
  return "text-[#d47470]";
}

export function formatMemory(kb) {
  if (!kb) return "—";
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

export function formatRuntime(seconds) {
  if (!seconds) return "—";
  return `${Math.round(seconds * 1000)} ms`;
}

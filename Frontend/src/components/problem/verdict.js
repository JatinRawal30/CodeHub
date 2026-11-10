// Theme-aware styling for verdicts / test statuses on the problem page
export function verdictTone(verdict) {
  if (verdict === "Accepted" || verdict === "Passed") return "success";
  if (verdict === "Pending") return "warning";
  return "danger";
}

const TEXT = { success: "text-success-fg", warning: "text-warning-fg", danger: "text-danger-fg" };

// Text color for a verdict
export function verdictText(verdict) {
  return TEXT[verdictTone(verdict)];
}

// Badge classes for a verdict
export function verdictBadge(verdict) {
  return `badge badge-${verdictTone(verdict)}`;
}

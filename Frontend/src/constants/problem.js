export function formatMemory(kb) {
  if (!kb) return "—";
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

export function formatRuntime(seconds) {
  if (!seconds) return "—";
  return `${Math.round(seconds * 1000)} ms`;
}

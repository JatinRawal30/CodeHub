// "3 days ago", "yesterday", "just now" for a date string
const relativeTime = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

export function timeAgo(dateString) {
  const seconds = Math.round((new Date(dateString).getTime() - Date.now()) / 1000);
  const units = [
    ["year", 365 * 24 * 3600],
    ["month", 30 * 24 * 3600],
    ["day", 24 * 3600],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relativeTime.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

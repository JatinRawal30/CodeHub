import { Link } from "react-router";
import { getLanguageLabel } from "../../constants/languages";
import { DIFFICULTY_COLORS } from "../../constants/problem";

const relativeTime = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

function timeAgo(dateString) {
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

export default function RecentAcList({ items = [] }) {
  return (
    <section className="bg-[#1a1b1f] border border-[#2a2c31] rounded-xl overflow-hidden">
      <div className="px-5 py-4 flex items-center gap-2 border-b border-[#2a2c31]">
        <span className="text-[#68b582]">✓</span>
        <h2 className="text-sm font-semibold text-white">Recent AC</h2>
      </div>

      {items.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <p className="text-sm text-white font-medium">No accepted submissions yet</p>
          <Link to="/" className="text-xs text-[#e2a24a] hover:underline">
            Find a problem to solve
          </Link>
        </div>
      ) : (
        <ul>
          {items.map((item, idx) => (
            <li
              key={item.submissionId || idx}
              className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[#202226] first:border-t-0 hover:bg-[#202226] transition-colors"
            >
              <div className="min-w-0 flex items-center gap-2">
                {item.problemID ? (
                  <Link
                    to={`/problems/${item.problemID}`}
                    className="text-sm text-white hover:text-[#e2a24a] font-medium truncate transition-colors"
                  >
                    {item.title}
                  </Link>
                ) : (
                  <span className="text-sm text-[#9a9ca3] italic">Deleted problem</span>
                )}
                {item.difficulty && (
                  <span className={`text-xs capitalize ${DIFFICULTY_COLORS[item.difficulty] || ""}`}>
                    {item.difficulty}
                  </span>
                )}
              </div>
              <div className="shrink-0 flex items-center gap-3 text-xs text-[#9a9ca3]">
                <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-[#202226]">
                  {getLanguageLabel(item.language)}
                </span>
                <span title={new Date(item.solvedAt).toLocaleString()}>{timeAgo(item.solvedAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

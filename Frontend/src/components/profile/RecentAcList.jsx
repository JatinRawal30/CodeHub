import { Link } from "react-router";
import { getLanguageLabel } from "../../constants/languages";
import { timeAgo } from "../../utils/timeAgo";

export default function RecentAcList({ items = [] }) {
  return (
    <section className="card overflow-hidden">
      <div className="px-5 py-3.5 flex items-center gap-2 border-b border-line">
        <span className="text-success-fg text-body-sm">✓</span>
        <h2 className="label-caps text-fg-muted">Recent AC</h2>
      </div>

      {items.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <p className="text-body-md text-fg font-medium">No accepted submissions yet</p>
          <Link to="/" className="text-body-sm text-primary hover:text-primary-hover hover:underline">
            Find a problem to solve
          </Link>
        </div>
      ) : (
        <ul>
          {items.map((item, idx) => (
            <li
              key={item.submissionId || idx}
              className="flex items-center justify-between gap-3 px-5 py-3 border-t border-line-subtle first:border-t-0 hover:bg-surface-hover transition-colors"
            >
              <div className="min-w-0 flex items-center gap-2">
                {item.problemID ? (
                  <Link
                    to={`/problems/${item.problemID}`}
                    className="text-body-md text-fg hover:text-primary font-medium truncate transition-colors"
                  >
                    {item.title}
                  </Link>
                ) : (
                  <span className="text-body-md text-fg-subtle italic">Deleted problem</span>
                )}
                {item.difficulty && (
                  <span className={`badge capitalize ${item.difficulty === "easy" || item.difficulty === "medium" || item.difficulty === "hard" ? `badge-${item.difficulty}` : "badge-neutral"}`}>
                    {item.difficulty}
                  </span>
                )}
              </div>
              <div className="shrink-0 flex items-center gap-3 text-fg-muted">
                <span className="hidden sm:inline-flex badge badge-neutral">
                  {getLanguageLabel(item.language)}
                </span>
                <span className="text-code-sm text-fg-subtle" title={new Date(item.solvedAt).toLocaleString()}>{timeAgo(item.solvedAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

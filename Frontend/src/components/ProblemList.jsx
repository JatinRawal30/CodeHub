import { Link } from "react-router";

// status | title | level | topics; level and topics drop under the title on phones
const COLUMNS = "grid grid-cols-[4.5rem_1fr] items-center gap-y-1 px-4 md:grid-cols-[4.5rem_1fr_8rem_17rem]";
const UNDER_TITLE = "col-start-2 pl-10 md:col-start-auto md:pl-0";

const LEVEL = {
  easy: { text: "text-success-fg", dot: "bg-success" },
  medium: { text: "text-warning-fg", dot: "bg-warning" },
  hard: { text: "text-danger-fg", dot: "bg-danger" },
};

export default function ProblemList({
  problems = [],
  solvedProblemIds = new Set(),
  isLoading = false,
  hasFilters = false,
  pageSize = 10,
}) {
  return (
    <>
      <div className={`${COLUMNS} mt-10 hidden pb-3 text-xs uppercase tracking-[0.18em] text-fg-subtle md:grid`}>
        <span>Status</span>
        <span>Title</span>
        <span>Level</span>
        <span>Topics</span>
      </div>

      <ul className="mt-6 md:mt-0" aria-busy={isLoading}>
        {isLoading ? (
          [...Array(pageSize)].map((_, i) => (
            <li key={i} className={`${COLUMNS} animate-pulse py-4`} aria-hidden="true">
              <span className="ml-2 block size-1.5 rounded-full bg-surface-hover" />
              <span className="h-6 w-2/3 rounded-full bg-surface-hover" />
              <span className={`${UNDER_TITLE} hidden h-4 w-14 rounded-full bg-surface-hover md:block`} />
              <span className={`${UNDER_TITLE} hidden h-4 w-36 rounded-full bg-surface-hover md:block`} />
            </li>
          ))
        ) : problems.length > 0 ? (
          problems.map((prob, i) => {
            const isSolved = solvedProblemIds.has(prob._id?.toString());
            const diff = (prob.difficulty || "medium").toLowerCase();
            const level = LEVEL[diff] || LEVEL.medium;

            return (
              <li key={prob._id || i} style={{ animationDelay: `${i * 30}ms` }} className="fade-up">
                <Link
                  to={`/problems/${prob.problemID}`}
                  className={`group ${COLUMNS} rounded-2xl py-4 transition-colors hover:bg-surface`}
                >
                  <span>
                    {isSolved ? (
                      <span className="flex size-6 items-center justify-center rounded-full bg-green-500/15 text-green-600 dark:text-green-400">
                        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        <span className="sr-only">Solved</span>
                      </span>
                    ) : (
                      <span className="ml-2 block size-1.5 rounded-full bg-fg-subtle/60" />
                    )}
                  </span>
                  <span className="flex items-baseline gap-3 truncate">
                    <span className="w-7 shrink-0 text-right font-mono text-xs text-fg-subtle">{prob.problemID}</span>
                    <span className="truncate font-display text-base font-medium text-fg transition-colors group-hover:text-primary">
                      {prob.title}
                    </span>
                  </span>
                  <span className={`${UNDER_TITLE} flex items-center gap-2 text-sm capitalize ${level.text}`}>
                    <span className={`size-1.5 rounded-full ${level.dot}`} />
                    {diff}
                  </span>
                  <span className={`${UNDER_TITLE} truncate font-display text-sm text-fg-muted`}>
                    {Array.isArray(prob.tags) ? prob.tags.join(" · ") : ""}
                  </span>
                </Link>
              </li>
            );
          })
        ) : (
          <li className="py-20 text-center text-base text-fg-muted">
            {hasFilters
              ? "No questions match that search — try something softer."
              : "No problems have been added yet."}
          </li>
        )}
      </ul>
    </>
  );
}

import { Link } from "react-router";

const DIFFICULTY_BADGE = {
  easy: "badge-easy",
  medium: "badge-medium",
  hard: "badge-hard",
};

export default function ProblemTable({
  problems = [],
  solvedProblemIds = new Set(),
  isLoading = false,
  searchQuery = "",
  selectedDifficulty = "all",
  selectedStatus = "all",
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-body-md">
        <thead className="bg-surface-alt border-b border-line label-caps text-fg-muted">
          <tr>
            <th className="py-2.5 px-4 w-12 text-center">Status</th>
            <th className="py-2.5 px-4">Title</th>
            <th className="py-2.5 px-4 w-32">Difficulty</th>
            <th className="py-2.5 px-4 w-48 hidden sm:table-cell">Tags</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-subtle">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="py-4 px-4 text-center">
                  <div className="w-4 h-4 bg-surface-hover rounded-full mx-auto" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-surface-hover rounded w-3/4 mb-1" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-surface-hover rounded w-16" />
                </td>
                <td className="py-4 px-4 hidden sm:table-cell">
                  <div className="h-4 bg-surface-hover rounded w-24" />
                </td>
              </tr>
            ))
          ) : problems.length > 0 ? (
            problems.map((prob, idx) => {
              const isSolved = solvedProblemIds.has(prob._id?.toString());
              const diff = (prob.difficulty || "medium").toLowerCase();

              return (
                <tr
                  key={prob._id || idx}
                  className="bg-surface hover:bg-surface-hover transition-colors"
                >
                  <td className="py-3.5 px-4 text-center">
                    {isSolved ? (
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-success-soft text-success text-xs font-bold"
                        title="Solved"
                      >
                        ✓
                      </span>
                    ) : (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-line-strong" />
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-code-sm text-fg-subtle">
                        {prob.problemID ? `${prob.problemID}.` : ""}
                      </span>
                      <Link
                        to={`/problems/${prob.problemID}`}
                        className="text-fg hover:text-primary font-medium transition-colors"
                      >
                        {prob.title}
                      </Link>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 capitalize">
                    <span className={`badge ${DIFFICULTY_BADGE[diff] || "badge-medium"}`}>
                      {diff}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {Array.isArray(prob.tags) && prob.tags.length > 0 ? (
                        prob.tags.slice(0, 3).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="badge badge-neutral"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-fg-subtle">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="4" className="py-12 text-center text-fg-muted">
                <div className="max-w-sm mx-auto space-y-2">
                  <p className="text-body-lg text-fg font-medium">No problems found</p>
                  <p className="text-body-sm text-fg-muted">
                    {searchQuery || selectedDifficulty !== "all" || selectedStatus !== "all"
                      ? "Try resetting your search query or filters to see more results."
                      : "No problems have been added to the database yet."}
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

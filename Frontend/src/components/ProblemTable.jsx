import { Link } from "react-router";
import { DIFFICULTY_COLORS } from "../constants/problem";

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
      <table className="w-full text-left text-sm">
        <thead className="bg-[#16171a] border-b border-[#2a2c31] text-xs font-semibold text-[#9a9ca3]">
          <tr>
            <th className="py-3.5 px-4 w-12 text-center">Status</th>
            <th className="py-3.5 px-4">Title</th>
            <th className="py-3.5 px-4 w-32">Difficulty</th>
            <th className="py-3.5 px-4 w-48 hidden sm:table-cell">Tags</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#202226]">
          {isLoading ? (
            // Skeleton Loader (6 animated placeholder rows)
            [...Array(6)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="py-4 px-4 text-center">
                  <div className="w-4 h-4 bg-[#202226] rounded-full mx-auto" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-[#202226] rounded w-3/4 mb-1" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-[#202226] rounded w-16" />
                </td>
                <td className="py-4 px-4 hidden sm:table-cell">
                  <div className="h-4 bg-[#202226] rounded w-24" />
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
                  className="bg-[#18191c] hover:bg-[#202226] transition-colors"
                >
                  {/* Solved Status Indicator */}
                  <td className="py-3.5 px-4 text-center">
                    {isSolved ? (
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#5fb39f]/20 text-[#5fb39f] font-bold"
                        title="Solved"
                      >
                        ✓
                      </span>
                    ) : (
                      <span className="inline-block w-2 h-2 rounded-full bg-[#33363c]" />
                    )}
                  </td>

                  {/* Problem Title */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[#9a9ca3] text-xs tabular-nums">
                        {prob.problemID ? `${prob.problemID}.` : ""}
                      </span>
                      <Link
                        to={`/problems/${prob.problemID}`}
                        className="text-white hover:text-[#e2a24a] font-medium transition-colors"
                      >
                        {prob.title}
                      </Link>
                    </div>
                  </td>

                  {/* Difficulty */}
                  <td className="py-3.5 px-4 capitalize font-medium text-xs">
                    <span className={DIFFICULTY_COLORS[diff] || "text-[#d6b45f]"}>
                      {diff}
                    </span>
                  </td>

                  {/* Tags */}
                  <td className="py-3.5 px-4 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {Array.isArray(prob.tags) && prob.tags.length > 0 ? (
                        prob.tags.slice(0, 3).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[11px] bg-[#202226] text-[#a3a5ab] px-2 py-0.5 rounded-full border border-[#33363c]"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[#6b6e76]">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="4" className="py-12 text-center text-[#9a9ca3]">
                <div className="max-w-sm mx-auto space-y-2">
                  <p className="text-base text-white font-medium">No problems found</p>
                  <p className="text-xs text-[#767980]">
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

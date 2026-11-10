export default function ProblemFilters({
  searchQuery,
  onSearchChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedStatus,
  onStatusChange,
}) {
  // a select that's narrowing the list gets the primary-soft treatment
  const selectClass = (isActive) =>
    `input w-auto h-8 pr-8 text-body-sm cursor-pointer ${
      isActive ? "bg-primary-soft text-primary-soft-fg border-primary-soft-line" : ""
    }`;

  return (
    <div className="card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3">
      <div className="relative flex-1 max-w-md">
        <svg
          className="w-4 h-4 text-fg-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search questions by title or ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input pl-9"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={selectedDifficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          className={selectClass(selectedDifficulty !== "all")}
        >
          <option value="all">Difficulty: All</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className={selectClass(selectedStatus !== "all")}
        >
          <option value="all">Status: All</option>
          <option value="solved">Solved</option>
          <option value="unsolved">Unsolved</option>
        </select>
      </div>
    </div>
  );
}

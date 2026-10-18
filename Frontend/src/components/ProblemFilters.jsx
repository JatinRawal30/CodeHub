export default function ProblemFilters({
  searchQuery,
  onSearchChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedStatus,
  onStatusChange,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#18191c] border border-[#2a2c31] p-3 rounded-xl">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <svg
          className="w-4 h-4 text-[#9a9ca3] absolute left-3 top-1/2 -translate-y-1/2"
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
          className="w-full bg-[#151619] border border-[#2a2c31] focus:border-[#e2a24a] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-[#6b6e76] outline-none transition-colors"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Difficulty Filter */}
        <select
          value={selectedDifficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          className="bg-[#151619] border border-[#2a2c31] hover:border-[#3a3d44] text-[#c4c6cb] text-xs rounded-lg px-3 py-2 outline-none cursor-pointer transition-colors"
        >
          <option value="all">Difficulty: All</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-[#151619] border border-[#2a2c31] hover:border-[#3a3d44] text-[#c4c6cb] text-xs rounded-lg px-3 py-2 outline-none cursor-pointer transition-colors"
        >
          <option value="all">Status: All</option>
          <option value="solved">Solved</option>
          <option value="unsolved">Unsolved</option>
        </select>
      </div>
    </div>
  );
}

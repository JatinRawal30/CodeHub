const LEVELS = [
  ["all", "All"],
  ["easy", "Easy"],
  ["medium", "Medium"],
  ["hard", "Hard"],
];
const STATUSES = [
  ["all", "All"],
  ["solved", "Solved"],
  ["unsolved", "Unsolved"],
];

export function Segmented({ label, options, value, onChange }) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
      <span className="mr-2 text-xs uppercase tracking-[0.18em] text-fg-subtle">{label}</span>
      {options.map(([id, text]) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={value === id}
          onClick={() => onChange(id)}
          className={`cursor-pointer rounded-full px-3 py-1.5 text-sm transition-colors hover:text-fg ${
            value === id ? "bg-surface-hover text-fg" : "text-fg-muted"
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export default function ProblemFilters({
  searchQuery,
  onSearchChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedStatus,
  onStatusChange,
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
      <label className="flex h-11 min-w-0 flex-1 basis-72 items-center gap-3 rounded-full bg-surface px-5 text-fg-muted transition-colors focus-within:bg-surface-hover">
        <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          type="text"
          aria-label="Search questions"
          placeholder="Search questions by title or number…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-transparent text-base text-fg outline-none placeholder:text-fg-muted"
        />
      </label>
      <Segmented label="Level" options={LEVELS} value={selectedDifficulty} onChange={onDifficultyChange} />
      {/* the admin list has no solved/unsolved state */}
      {onStatusChange && (
        <Segmented label="Status" options={STATUSES} value={selectedStatus} onChange={onStatusChange} />
      )}
    </div>
  );
}

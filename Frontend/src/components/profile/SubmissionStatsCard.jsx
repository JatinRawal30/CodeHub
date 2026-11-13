// Tailwind's green-500, red-500, yellow-400 and orange-400: plain verdict colors rather than the theme's softer mint, coral and gold
const VERDICT_ROWS = [
  { key: "accepted", label: "Accepted", color: "oklch(72.3% 0.219 149.579)" },
  { key: "wrongAnswer", label: "Wrong Answer", color: "oklch(63.7% 0.237 25.331)" },
  { key: "timeLimitExceeded", label: "Time Limit Exceeded", color: "oklch(85.2% 0.199 91.936)" },
  { key: "runtimeError", label: "Runtime Error", color: "oklch(75% 0.183 55.934)" },
  { key: "compilationError", label: "Compilation Error", color: "var(--fg-subtle)" },
];

export default function SubmissionStatsCard({ submissionStats }) {
  const { totalSubmissions = 0, totalAccepted = 0, acceptanceRate = "0.0%", verdicts = {} } = submissionStats || {};

  return (
    <section className="card p-5">
      <h2 className="label-caps text-fg-muted mb-4">Submissions</h2>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="px-3 py-2 rounded-md bg-surface-alt border border-line-subtle">
          <div className="label-caps text-fg-subtle">Acceptance</div>
          <div className="mt-0.5 font-mono text-headline-sm text-fg">{acceptanceRate}</div>
        </div>
        <div className="px-3 py-2 rounded-md bg-surface-alt border border-line-subtle">
          <div className="label-caps text-fg-subtle">Total</div>
          <div className="mt-0.5 font-mono text-headline-sm text-fg">{totalSubmissions}</div>
        </div>
        <div className="px-3 py-2 rounded-md bg-surface-alt border border-line-subtle">
          <div className="label-caps text-fg-subtle">Accepted</div>
          <div className="mt-0.5 font-mono text-headline-sm text-green-600 dark:text-green-400">{totalAccepted}</div>
        </div>
      </div>

      <ul className="space-y-2">
        {VERDICT_ROWS.map(({ key, label, color }) => {
          const count = verdicts[key] || 0;
          const percent = totalSubmissions ? (count / totalSubmissions) * 100 : 0;
          return (
            <li key={key} className="text-body-sm">
              <div className="flex justify-between mb-1">
                <span className="text-fg-body">{label}</span>
                <span className="text-code-sm text-fg-muted">{count}</span>
              </div>
              <div className="h-1 rounded-full bg-surface-hover overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: color }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

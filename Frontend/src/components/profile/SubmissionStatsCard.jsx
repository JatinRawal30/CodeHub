const VERDICT_ROWS = [
  { key: "accepted", label: "Accepted", color: "var(--success)" },
  { key: "wrongAnswer", label: "Wrong Answer", color: "var(--danger)" },
  { key: "timeLimitExceeded", label: "Time Limit Exceeded", color: "var(--warning)" },
  { key: "runtimeError", label: "Runtime Error", color: "color-mix(in srgb, var(--danger) 55%, var(--warning))" },
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
          <div className="mt-0.5 font-mono text-headline-sm text-success-fg">{totalAccepted}</div>
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

const VERDICT_ROWS = [
  { key: "accepted", label: "Accepted", color: "#68b582" },
  { key: "wrongAnswer", label: "Wrong Answer", color: "#d47470" },
  { key: "timeLimitExceeded", label: "Time Limit Exceeded", color: "#d6b45f" },
  { key: "runtimeError", label: "Runtime Error", color: "#d08f63" },
  { key: "compilationError", label: "Compilation Error", color: "#9c92c9" },
];

export default function SubmissionStatsCard({ submissionStats }) {
  const { totalSubmissions = 0, totalAccepted = 0, acceptanceRate = "0.0%", verdicts = {} } = submissionStats || {};

  return (
    <section className="bg-[#1a1b1f] border border-[#2a2c31] rounded-xl p-5">
      <h2 className="text-sm font-semibold text-white mb-4">Submissions</h2>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="px-3 py-2 rounded-lg bg-[#151619] border border-[#202226]">
          <div className="text-[11px] text-[#9a9ca3]">Acceptance</div>
          <div className="text-lg font-semibold text-white tabular-nums">{acceptanceRate}</div>
        </div>
        <div className="px-3 py-2 rounded-lg bg-[#151619] border border-[#202226]">
          <div className="text-[11px] text-[#9a9ca3]">Total</div>
          <div className="text-lg font-semibold text-white tabular-nums">{totalSubmissions}</div>
        </div>
        <div className="px-3 py-2 rounded-lg bg-[#151619] border border-[#202226]">
          <div className="text-[11px] text-[#9a9ca3]">Accepted</div>
          <div className="text-lg font-semibold text-[#68b582] tabular-nums">{totalAccepted}</div>
        </div>
      </div>

      <ul className="space-y-2">
        {VERDICT_ROWS.map(({ key, label, color }) => {
          const count = verdicts[key] || 0;
          const percent = totalSubmissions ? (count / totalSubmissions) * 100 : 0;
          return (
            <li key={key} className="text-xs">
              <div className="flex justify-between mb-1">
                <span className="text-[#c4c6cb]">{label}</span>
                <span className="text-[#9a9ca3] tabular-nums">{count}</span>
              </div>
              <div className="h-1 rounded-full bg-[#2c2e33] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: color }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

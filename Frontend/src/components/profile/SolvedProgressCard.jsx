const DIFFICULTIES = [
  { key: "easy", label: "Easy", color: "#5fb39f" },
  { key: "medium", label: "Med.", color: "#d6b45f" },
  { key: "hard", label: "Hard", color: "#d47470" },
];

const SIZE = 132;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Ring split into easy / medium / hard arcs, each sized relative to ALL problems
function SolvedRing({ breakdown, totalSolved, totalProblems }) {
  // Each arc starts where the previous one ended
  const arcs = DIFFICULTIES.reduce((list, { key, color }) => {
    const length = totalProblems ? ((breakdown[key] || 0) / totalProblems) * CIRCUMFERENCE : 0;
    const previous = list[list.length - 1];
    const offset = previous ? previous.offset + previous.length : 0;
    return [...list, { key, color, length, offset }];
  }, []);

  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#2c2e33" strokeWidth={STROKE} />
        {arcs
          .filter((a) => a.length > 0)
          .map((a) => (
            <circle
              key={a.key}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={a.color}
              strokeWidth={STROKE}
              strokeDasharray={`${a.length} ${CIRCUMFERENCE - a.length}`}
              strokeDashoffset={-a.offset}
            />
          ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="tabular-nums">
          <span className="text-2xl font-semibold text-white">{totalSolved}</span>
          <span className="text-sm text-[#9a9ca3]">/{totalProblems}</span>
        </div>
        <div className="text-xs text-[#9a9ca3] mt-0.5">✓ Solved</div>
      </div>
    </div>
  );
}

export default function SolvedProgressCard({ solvedStats }) {
  const { totalSolved = 0, breakdown = {}, totalProblems = 0, totalByDifficulty = {} } = solvedStats || {};

  return (
    <section className="bg-[#1a1b1f] border border-[#2a2c31] rounded-xl p-5">
      <h2 className="text-sm font-semibold text-white mb-4">Solved Problems</h2>
      <div className="flex items-center gap-6">
        <SolvedRing breakdown={breakdown} totalSolved={totalSolved} totalProblems={totalProblems} />

        <div className="flex-1 space-y-2">
          {DIFFICULTIES.map(({ key, label, color }) => {
            const solved = breakdown[key] || 0;
            const total = totalByDifficulty[key] || 0;
            return (
              <div key={key} className="px-3 py-2 rounded-lg bg-[#151619] border border-[#202226]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium" style={{ color }}>{label}</span>
                  <span className="tabular-nums">
                    <span className="font-semibold text-white">{solved}</span>
                    <span className="text-[#9a9ca3]">/{total}</span>
                  </span>
                </div>
                <div className="mt-1.5 h-1 rounded-full bg-[#2c2e33] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${total ? (solved / total) * 100 : 0}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

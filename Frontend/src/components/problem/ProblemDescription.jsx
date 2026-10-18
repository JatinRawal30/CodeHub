import { DIFFICULTY_BADGES } from "../../constants/problem";

export default function ProblemDescription({ problem, isSolved }) {
  const difficulty = (problem.difficulty || "medium").toLowerCase();

  return (
    <div className="px-5 py-4 space-y-5 text-sm text-[#e6e7ea]">
      {/* Title */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-semibold text-white">
            {problem.problemID}. {problem.title}
          </h1>
          {isSolved && (
            <span className="shrink-0 mt-1 flex items-center gap-1 text-xs text-[#68b582]">
              <span>✓</span> Solved
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${DIFFICULTY_BADGES[difficulty] || DIFFICULTY_BADGES.medium}`}>
            {difficulty}
          </span>
          {problem.tags?.map((tag) => (
            <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs bg-[#2c2e33] text-[#c4c6cb] capitalize">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Statement */}
      <p className="whitespace-pre-wrap leading-relaxed text-[#d4d5d9]">{problem.description}</p>

      {/* Examples */}
      {problem.visibleTestCases?.map((tc, i) => (
        <div key={tc._id || i} className="space-y-2">
          <h3 className="font-semibold text-white">Example {i + 1}:</h3>
          <div className="border-l-2 border-[#3a3d44] pl-4 space-y-2 text-[13px]">
            <div>
              <span className="font-semibold text-white">Input:</span>
              <pre className="mt-1 font-mono text-[#c4c6cb] whitespace-pre-wrap">{tc.input}</pre>
            </div>
            <div>
              <span className="font-semibold text-white">Output:</span>
              <pre className="mt-1 font-mono text-[#c4c6cb] whitespace-pre-wrap">{tc.output}</pre>
            </div>
            {tc.explanation && (
              <div>
                <span className="font-semibold text-white">Explanation: </span>
                <span className="text-[#c4c6cb]">{tc.explanation}</span>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Constraints */}
      {problem.constraints?.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-white">Constraints:</h3>
          <ul className="list-disc pl-5 space-y-1.5">
            {problem.constraints.map((c, i) => (
              <li key={i}>
                <code className="px-1.5 py-0.5 rounded bg-[#2c2e33] text-[#d4d5d9] text-xs font-mono">{c}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Limits */}
      <div className="pt-3 border-t border-[#2a2c31] flex gap-6 text-xs text-[#9a9ca3]">
        <span>Time limit: {problem.timeLimit ?? 1} s</span>
        <span>Memory limit: {problem.memoryLimit ?? 256} MB</span>
      </div>
    </div>
  );
}

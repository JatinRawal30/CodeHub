const DIFFICULTY_BADGES = {
  easy: "badge-easy",
  medium: "badge-medium",
  hard: "badge-hard",
};

export default function ProblemDescription({ problem, isSolved }) {
  const difficulty = (problem.difficulty || "medium").toLowerCase();

  return (
    <div className="px-5 py-4 space-y-5 text-body-md text-fg-body">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-headline-sm text-fg">
            {problem.problemID}. {problem.title}
          </h1>
          {isSolved && (
            <span className="badge badge-success shrink-0 mt-1">
              <span>✓</span> Solved
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`badge capitalize ${DIFFICULTY_BADGES[difficulty] || DIFFICULTY_BADGES.medium}`}>
            {difficulty}
          </span>
          {problem.tags?.map((tag) => (
            <span key={tag} className="badge badge-neutral capitalize">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <p className="whitespace-pre-wrap leading-relaxed text-fg-body">{problem.description}</p>

      {problem.visibleTestCases?.map((tc, i) => (
        <div key={tc._id || i} className="space-y-2">
          <h3 className="font-semibold text-fg">Example {i + 1}:</h3>
          <div className="rounded-lg border border-line bg-surface-alt px-4 py-3 space-y-2 text-body-sm">
            <div>
              <span className="font-semibold text-fg">Input:</span>
              <pre className="mt-1 text-code-md font-normal text-fg-body whitespace-pre-wrap">{tc.input}</pre>
            </div>
            <div>
              <span className="font-semibold text-fg">Output:</span>
              <pre className="mt-1 text-code-md font-normal text-fg-body whitespace-pre-wrap">{tc.output}</pre>
            </div>
            {tc.explanation && (
              <div>
                <span className="font-semibold text-fg">Explanation: </span>
                <span className="text-fg-body">{tc.explanation}</span>
              </div>
            )}
          </div>
        </div>
      ))}

      {problem.constraints?.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-fg">Constraints:</h3>
          <ul className="list-disc pl-5 space-y-1.5 marker:text-fg-subtle">
            {problem.constraints.map((c, i) => (
              <li key={i}>
                <code className="px-1.5 py-0.5 rounded border border-line bg-surface-alt text-fg-body text-code-sm">{c}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-3 border-t border-line flex gap-6 text-body-sm text-fg-muted">
        <span>Time limit: <span className="font-mono tabular-nums text-fg-body">{problem.timeLimit ?? 1} s</span></span>
        <span>Memory limit: <span className="font-mono tabular-nums text-fg-body">{problem.memoryLimit ?? 256} MB</span></span>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { fetchSubmissions, getApiErrorMessage } from "../../api/execution";
import { getLanguageLabel } from "../../constants/languages";
import { formatMemory, formatRuntime } from "../../constants/problem";
import { verdictText } from "./verdict";

// `refreshKey` changes after each submission so the list reloads
export default function SubmissionsList({ problemId, refreshKey, onLoadCode }) {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const list = await fetchSubmissions(problemId);
        if (isMounted) setSubmissions(list);
      } catch (err) {
        if (isMounted) setError(getApiErrorMessage(err, "Failed to load submissions"));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [problemId, refreshKey]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 rounded-md bg-surface-hover animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="p-8 text-center text-body-sm text-fg-muted">
        No submissions yet. Write a solution and press <span className="font-medium text-fg">Submit</span>.
      </div>
    );
  }

  return (
    <div className="text-body-md">
      <div className="sticky top-0 grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-2 px-4 py-2 label-caps text-fg-muted bg-surface-alt border-b border-line">
        <span>Status</span>
        <span>Language</span>
        <span>Runtime</span>
        <span>Memory</span>
      </div>

      {submissions.map((s) => {
        const isExpanded = expandedId === s._id;
        return (
          <div key={s._id} className="border-b border-line-subtle">
            <button
              onClick={() => setExpandedId(isExpanded ? null : s._id)}
              className={`w-full grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-2 px-4 py-2.5 text-left hover:bg-surface-hover transition-colors cursor-pointer ${
                isExpanded ? "bg-surface-alt" : ""
              }`}
            >
              <span>
                <span className={`font-medium ${verdictText(s.verdict)}`}>{s.verdict}</span>
                <span className="block text-code-sm font-normal text-fg-subtle">
                  {new Date(s.createdAt).toLocaleString()}
                </span>
              </span>
              <span className="text-fg-body self-center">{getLanguageLabel(s.language)}</span>
              <span className="text-code-md font-normal text-fg-body self-center">{formatRuntime(s.executionTime)}</span>
              <span className="text-code-md font-normal text-fg-body self-center">{formatMemory(s.memory)}</span>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 pt-1 space-y-2 bg-surface-alt">
                <div className="flex items-center justify-between text-body-sm text-fg-muted">
                  <span className="font-mono tabular-nums">
                    {s.testCasesPassed} / {s.totalTestCases} test cases passed
                  </span>
                  <button
                    onClick={() => onLoadCode(s.language, s.code)}
                    className="btn btn-secondary h-7 px-2.5 text-body-sm"
                  >
                    Load into editor
                  </button>
                </div>
                {s.errorMessage && (
                  <pre className="p-3 rounded-lg border border-danger-line bg-danger-soft text-danger-fg text-code-sm font-normal whitespace-pre-wrap">
                    {s.errorMessage}
                  </pre>
                )}
                <pre className="p-3 rounded-lg border border-line bg-surface text-fg-body text-code-sm font-normal overflow-x-auto max-h-72">
                  {s.code}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

import { useEffect, useState } from "react";
import { fetchSubmissions, getApiErrorMessage } from "../../api/execution";
import { getLanguageLabel } from "../../constants/languages";
import { formatMemory, formatRuntime, verdictColor } from "../../constants/problem";

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
          <div key={i} className="h-10 rounded-lg bg-[#202226] animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="p-5 text-sm text-[#d47470]">{error}</p>;
  }

  if (submissions.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-[#9a9ca3]">
        No submissions yet. Write a solution and press <span className="text-white">Submit</span>.
      </div>
    );
  }

  return (
    <div className="text-sm">
      <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-2 px-4 py-2.5 text-xs font-semibold text-[#9a9ca3] border-b border-[#2a2c31]">
        <span>Status</span>
        <span>Language</span>
        <span>Runtime</span>
        <span>Memory</span>
      </div>

      {submissions.map((s) => {
        const isExpanded = expandedId === s._id;
        return (
          <div key={s._id} className="border-b border-[#202226]">
            <button
              onClick={() => setExpandedId(isExpanded ? null : s._id)}
              className="w-full grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-2 px-4 py-2.5 text-left hover:bg-[#202226] transition-colors cursor-pointer"
            >
              <span>
                <span className={`font-medium ${verdictColor(s.verdict)}`}>{s.verdict}</span>
                <span className="block text-[11px] text-[#767980]">
                  {new Date(s.createdAt).toLocaleString()}
                </span>
              </span>
              <span className="text-[#c4c6cb] self-center">{getLanguageLabel(s.language)}</span>
              <span className="text-[#c4c6cb] self-center">{formatRuntime(s.executionTime)}</span>
              <span className="text-[#c4c6cb] self-center">{formatMemory(s.memory)}</span>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#9a9ca3]">
                  <span>
                    {s.testCasesPassed} / {s.totalTestCases} test cases passed
                  </span>
                  <button
                    onClick={() => onLoadCode(s.language, s.code)}
                    className="px-2.5 py-1 rounded-md bg-[#2c2e33] text-[#e6e7ea] hover:bg-[#33363c] transition-colors cursor-pointer"
                  >
                    Load into editor
                  </button>
                </div>
                {s.errorMessage && (
                  <pre className="p-3 rounded-lg bg-[#d47470]/10 text-[#e09a96] text-xs font-mono whitespace-pre-wrap">
                    {s.errorMessage}
                  </pre>
                )}
                <pre className="p-3 rounded-lg bg-[#151619] text-[#d4d5d9] text-xs font-mono overflow-x-auto max-h-72">
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

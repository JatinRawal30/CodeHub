import { useState } from "react";
import { formatMemory, formatRuntime, verdictColor } from "../../constants/problem";

function TabButton({ isActive, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
        isActive ? "text-white bg-[#202226]" : "text-[#9a9ca3] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function CaseTabs({ count, active, onSelect, statuses }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            active === i ? "bg-[#2c2e33] text-white" : "text-[#9a9ca3] hover:bg-[#202226]"
          }`}
        >
          {statuses && (
            <span className={`w-1.5 h-1.5 rounded-full ${statuses[i] ? "bg-[#68b582]" : "bg-[#d47470]"}`} />
          )}
          Case {i + 1}
        </button>
      ))}
    </div>
  );
}

function Field({ label, value, tone = "default" }) {
  const toneClass = tone === "error" ? "bg-[#d47470]/10 text-[#e09a96]" : "bg-[#202226] text-[#e6e7ea]";
  return (
    <div className="space-y-1.5">
      <div className="text-xs text-[#9a9ca3]">{label}</div>
      <pre className={`px-3 py-2 rounded-lg font-mono text-[13px] whitespace-pre-wrap break-words ${toneClass}`}>
        {value === null || value === undefined || value === "" ? " " : value}
      </pre>
    </div>
  );
}

function Spinner({ label }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[#9a9ca3]">
      <div className="animate-spin h-4 w-4 border-2 border-[#e2a24a] border-t-transparent rounded-full" />
      {label}
    </div>
  );
}

function TestcaseView({ testCases }) {
  const [active, setActive] = useState(0);
  if (!testCases?.length) return <p className="text-sm text-[#9a9ca3]">No example test cases.</p>;

  const tc = testCases[Math.min(active, testCases.length - 1)];
  return (
    <div className="space-y-4">
      <CaseTabs count={testCases.length} active={active} onSelect={setActive} />
      <Field label="Input" value={tc.input} />
      <Field label="Expected Output" value={tc.output} />
      <p className="text-[11px] text-[#767980]">Run tests your code against these example cases. Submit also runs hidden cases.</p>
    </div>
  );
}

function RunResultView({ data }) {
  const [active, setActive] = useState(0);

  if (data.status === "Compilation Error") {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[#d47470]">Compilation Error</h3>
        <Field label="Compiler output" value={data.error} tone="error" />
      </div>
    );
  }

  const results = data.results || [];
  if (results.length === 0) return <p className="text-sm text-[#9a9ca3]">No test cases were run.</p>;

  const allPassed = data.passed === data.totalTests;
  const headline = allPassed ? "Accepted" : results.find((r) => !r.passed)?.status || "Wrong Answer";
  const maxTime = Math.max(...results.map((r) => r.time || 0));
  const current = results[Math.min(active, results.length - 1)];

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-3">
        <h3 className={`text-lg font-semibold ${verdictColor(headline)}`}>{headline}</h3>
        <span className="text-xs text-[#9a9ca3]">
          {data.passed} / {data.totalTests} passed · Runtime: {formatRuntime(maxTime)}
        </span>
      </div>
      <CaseTabs
        count={results.length}
        active={active}
        onSelect={setActive}
        statuses={results.map((r) => r.passed)}
      />
      {!current.passed && current.status !== "Wrong Answer" && (
        <div className={`text-sm font-medium ${verdictColor(current.status)}`}>{current.status}</div>
      )}
      <Field label="Input" value={current.input} />
      <Field label="Output" value={current.actualOutput} />
      <Field label="Expected" value={current.expectedOutput} />
      {current.stderr && <Field label="Stderr" value={current.stderr} tone="error" />}
    </div>
  );
}

function SubmitResultView({ data }) {
  const isAccepted = data.verdict === "Accepted";
  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-3">
        <h3 className={`text-xl font-semibold ${verdictColor(data.verdict)}`}>{data.verdict}</h3>
        <span className="text-xs text-[#9a9ca3]">
          {data.testCasesPassed} / {data.totalTestCases} test cases passed
        </span>
      </div>

      {isAccepted && (
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <div className="p-3 rounded-lg bg-[#202226]">
            <div className="text-xs text-[#9a9ca3]">Runtime</div>
            <div className="text-lg font-semibold text-white">{formatRuntime(data.executionTime)}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#202226]">
            <div className="text-xs text-[#9a9ca3]">Memory</div>
            <div className="text-lg font-semibold text-white">{formatMemory(data.memory)}</div>
          </div>
        </div>
      )}

      {data.errorMessage && <Field label="Details" value={data.errorMessage} tone="error" />}
    </div>
  );
}

// result = null | { kind: "run" | "submit", status: "loading" | "done" | "error", data?, error? }
export default function ConsolePanel({ testCases, activeTab, onTabChange, result }) {
  let resultContent;
  if (!result) {
    resultContent = <p className="text-sm text-[#9a9ca3]">You must run or submit your code first.</p>;
  } else if (result.status === "loading") {
    resultContent = <Spinner label={result.kind === "submit" ? "Judging your submission…" : "Running your code…"} />;
  } else if (result.status === "error") {
    resultContent = <Field label="Error" value={result.error} tone="error" />;
  } else if (result.kind === "run") {
    resultContent = <RunResultView key={result.id} data={result.data} />;
  } else {
    resultContent = <SubmitResultView data={result.data} />;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="h-10 shrink-0 flex items-center gap-1 px-2 border-b border-[#2a2c31] bg-[#18191c]">
        <TabButton isActive={activeTab === "testcase"} onClick={() => onTabChange("testcase")}>
          <span className="text-[#68b582] mr-1">✓</span> Testcase
        </TabButton>
        <TabButton isActive={activeTab === "result"} onClick={() => onTabChange("result")}>
          <span className="text-[#68b582] mr-1">{">_"}</span> Test Result
        </TabButton>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {activeTab === "testcase" ? <TestcaseView testCases={testCases} /> : resultContent}
      </div>
    </div>
  );
}

import { useState } from "react";
import { formatMemory, formatRuntime } from "../../constants/problem";
import { verdictBadge, verdictText } from "./verdict";

function TabButton({ isActive, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center h-7 px-2.5 rounded-md text-body-sm font-medium transition-colors cursor-pointer ${
        isActive ? "text-fg bg-surface shadow-card ring-1 ring-line" : "text-fg-muted hover:text-fg hover:bg-surface-hover"
      }`}
    >
      {children}
    </button>
  );
}

function CaseTabs({ count, active, onSelect, statuses }) {
  return (
    <div className="inline-flex flex-wrap gap-0.5 p-0.5 rounded-md bg-canvas-alt border border-line">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`flex items-center gap-1.5 h-6 px-2.5 rounded text-body-sm font-medium transition-colors cursor-pointer ${
            active === i ? "bg-surface text-fg shadow-card ring-1 ring-line" : "text-fg-muted hover:text-fg"
          }`}
        >
          {statuses && (
            <span className={`w-1.5 h-1.5 rounded-full ${statuses[i] ? "bg-success" : "bg-danger"}`} />
          )}
          Case {i + 1}
        </button>
      ))}
    </div>
  );
}

function Field({ label, value, tone = "default" }) {
  const toneClass =
    tone === "error" ? "bg-danger-soft text-danger-fg border-danger-line" : "bg-terminal text-terminal-fg border-line";
  return (
    <div className="space-y-1.5">
      <div className="label-caps text-fg-muted">{label}</div>
      <pre className={`px-3 py-2.5 rounded-lg border text-code-md font-normal whitespace-pre-wrap break-words ${toneClass}`}>
        {value === null || value === undefined || value === "" ? " " : value}
      </pre>
    </div>
  );
}

function Spinner({ label }) {
  return (
    <span className="badge badge-warning gap-2 px-2 py-1">
      <span className="spinner w-3 h-3 border-[1.5px]" />
      {label}
    </span>
  );
}

function TestcaseView({ testCases }) {
  const [active, setActive] = useState(0);
  if (!testCases?.length) return <p className="text-body-sm text-fg-muted">No example test cases.</p>;

  const tc = testCases[Math.min(active, testCases.length - 1)];
  return (
    <div className="space-y-4">
      <CaseTabs count={testCases.length} active={active} onSelect={setActive} />
      <Field label="Input" value={tc.input} />
      <Field label="Expected Output" value={tc.output} />
      <p className="text-body-sm text-fg-subtle">Run tests your code against these example cases. Submit also runs hidden cases.</p>
    </div>
  );
}

function RunResultView({ data }) {
  const [active, setActive] = useState(0);

  if (data.status === "Compilation Error") {
    return (
      <div className="space-y-3">
        <h3 className="text-headline-sm text-danger-fg">Compilation Error</h3>
        <Field label="Compiler output" value={data.error} tone="error" />
      </div>
    );
  }

  const results = data.results || [];
  if (results.length === 0) return <p className="text-body-sm text-fg-muted">No test cases were run.</p>;

  const allPassed = data.passed === data.totalTests;
  const headline = allPassed ? "Accepted" : results.find((r) => !r.passed)?.status || "Wrong Answer";
  const maxTime = Math.max(...results.map((r) => r.time || 0));
  const current = results[Math.min(active, results.length - 1)];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className={`text-headline-sm ${verdictText(headline)}`}>{headline}</h3>
        <span className="text-body-sm text-fg-muted">
          <span className="font-mono tabular-nums">{data.passed} / {data.totalTests}</span> passed · Runtime:{" "}
          <span className="font-mono tabular-nums">{formatRuntime(maxTime)}</span>
        </span>
      </div>
      <CaseTabs
        count={results.length}
        active={active}
        onSelect={setActive}
        statuses={results.map((r) => r.passed)}
      />
      {!current.passed && current.status !== "Wrong Answer" && (
        <div>
          <span className={verdictBadge(current.status)}>{current.status}</span>
        </div>
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
      <div className="flex items-center gap-3">
        <h3 className={`text-headline-md ${verdictText(data.verdict)}`}>{data.verdict}</h3>
        <span className="text-body-sm text-fg-muted">
          <span className="font-mono tabular-nums">
            {data.testCasesPassed} / {data.totalTestCases}
          </span>{" "}
          test cases passed
        </span>
      </div>

      {isAccepted && (
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <div className="p-3 rounded-lg bg-surface-alt border border-line">
            <div className="label-caps text-fg-muted">Runtime</div>
            <div className="mt-1 font-mono tabular-nums text-headline-sm text-fg">{formatRuntime(data.executionTime)}</div>
          </div>
          <div className="p-3 rounded-lg bg-surface-alt border border-line">
            <div className="label-caps text-fg-muted">Memory</div>
            <div className="mt-1 font-mono tabular-nums text-headline-sm text-fg">{formatMemory(data.memory)}</div>
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
    resultContent = <p className="text-body-sm text-fg-muted">You must run or submit your code first.</p>;
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
      <div className="h-9 shrink-0 flex items-center gap-1 px-1.5 border-b border-line bg-surface-alt">
        <TabButton isActive={activeTab === "testcase"} onClick={() => onTabChange("testcase")}>
          <span className="text-success mr-1.5">✓</span>Testcase
        </TabButton>
        <TabButton isActive={activeTab === "result"} onClick={() => onTabChange("result")}>
          <span className="text-primary font-mono text-code-sm mr-1.5">{">_"}</span>Test Result
        </TabButton>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {activeTab === "testcase" ? <TestcaseView testCases={testCases} /> : resultContent}
      </div>
    </div>
  );
}

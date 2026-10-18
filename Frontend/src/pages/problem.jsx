import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { useDispatch } from "react-redux";
import { Group, Panel, Separator } from "react-resizable-panels";
import api from "../api/axios";
import {
  fetchProblem,
  getApiErrorMessage,
  runCode,
  submitCode,
  waitForVerdict,
} from "../api/execution";
import { DEFAULT_LANGUAGE, LANGUAGES, getStarterCode } from "../constants/languages";
import { fetchUserProfile } from "../store/slices/authSlice";
import { readStorage, removeStorage, writeStorage } from "../utils/storage";
import ProblemHeader from "../components/problem/ProblemHeader";
import ProblemDescription from "../components/problem/ProblemDescription";
import SubmissionsList from "../components/problem/SubmissionsList";
import CodeEditorPanel from "../components/problem/CodeEditorPanel";
import ConsolePanel from "../components/problem/ConsolePanel";

const LANGUAGE_KEY = "codehub:language";
const codeKey = (problemDbId, language) => `codehub:code:${problemDbId}:${language}`;

function isSupportedLanguage(id) {
  return LANGUAGES.some((l) => l.id === id);
}

// Saved draft for this problem + language, else the starter code
function loadCode(problem, language) {
  return readStorage(codeKey(problem._id, language)) ?? getStarterCode(problem, language);
}

function ResizeHandle({ orientation }) {
  const isVertical = orientation === "vertical"; // separator between stacked panels
  return (
    <Separator className={`group flex items-center justify-center outline-none ${isVertical ? "h-2" : "w-2"}`}>
      <div
        className={`rounded-full bg-[#2c2e33] transition-colors group-data-[separator=hover]:bg-[#e2a24a]/70 group-data-[separator=active]:bg-[#e2a24a] group-data-[separator=focus]:bg-[#e2a24a]/70 ${
          isVertical ? "h-1 w-10" : "w-1 h-10"
        }`}
      />
    </Separator>
  );
}

function PanelTab({ isActive, onClick, children }) {
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

export default function ProblemPage() {
  const { problemId } = useParams();
  const dispatch = useDispatch();

  // Problem data
  const [problem, setProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSolved, setIsSolved] = useState(false);

  // Editor
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [code, setCode] = useState("");

  // Panels
  const [leftTab, setLeftTab] = useState("description");
  const [consoleTab, setConsoleTab] = useState("testcase");

  // Run / Submit
  const [result, setResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionsRefreshKey, setSubmissionsRefreshKey] = useState(0);
  const busyRef = useRef(false); // blocks double Run/Submit before state re-renders
  const unmountedRef = useRef(false); // stops verdict polling after leaving the page

  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  // Load the problem (and whether it's solved) whenever the URL changes
  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setLoadError("");
      setResult(null);
      setConsoleTab("testcase");
      setLeftTab("description");

      try {
        const [loadedProblem, solvedRes] = await Promise.all([
          fetchProblem(problemId),
          api.get("/problems/solved").catch(() => null), // non-critical
        ]);
        if (!isMounted) return;

        const preferred = readStorage(LANGUAGE_KEY);
        const initialLanguage = isSupportedLanguage(preferred)
          ? preferred
          : loadedProblem.starterCode?.language || DEFAULT_LANGUAGE;

        setProblem(loadedProblem);
        setLanguage(initialLanguage);
        setCode(loadCode(loadedProblem, initialLanguage));
        setIsSolved(
          Boolean(solvedRes?.data?.solvedProblems?.some((p) => p._id === loadedProblem._id))
        );
      } catch (err) {
        if (isMounted) {
          setLoadError(
            err.response?.status === 404
              ? "This problem doesn't exist."
              : getApiErrorMessage(err, "Failed to load the problem.")
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [problemId]);

  const handleCodeChange = (value) => {
    setCode(value);
    if (problem) writeStorage(codeKey(problem._id, language), value);
  };

  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage);
    writeStorage(LANGUAGE_KEY, nextLanguage);
    setCode(loadCode(problem, nextLanguage));
  };

  const handleReset = () => {
    if (!window.confirm("Reset to the starter code? Your current code for this language will be lost.")) return;
    removeStorage(codeKey(problem._id, language));
    setCode(getStarterCode(problem, language));
  };

  // From the Submissions tab: put an old submission back into the editor
  const handleLoadSubmissionCode = (submissionLanguage, submissionCode) => {
    setLanguage(submissionLanguage);
    writeStorage(LANGUAGE_KEY, submissionLanguage);
    setCode(submissionCode);
    writeStorage(codeKey(problem._id, submissionLanguage), submissionCode);
  };

  const handleRun = useCallback(async () => {
    if (!problem || busyRef.current) return;
    busyRef.current = true;
    setIsRunning(true);
    setConsoleTab("result");
    setResult({ kind: "run", status: "loading" });

    try {
      const data = await runCode({ problemId: problem._id, language, code });
      setResult({ kind: "run", status: "done", data, id: Date.now() });
    } catch (err) {
      setResult({ kind: "run", status: "error", error: getApiErrorMessage(err, "Run failed. Please try again.") });
    } finally {
      busyRef.current = false;
      setIsRunning(false);
    }
  }, [problem, language, code]);

  const handleSubmit = useCallback(async () => {
    if (!problem || busyRef.current) return;
    busyRef.current = true;
    setIsSubmitting(true);
    setConsoleTab("result");
    setResult({ kind: "submit", status: "loading" });

    try {
      const { submissionId } = await submitCode({ problemId: problem._id, language, code });
      const final = await waitForVerdict(submissionId, { isCancelled: () => unmountedRef.current });
      if (!final) return; // user left the page

      setResult({ kind: "submit", status: "done", data: final });
      if (final.verdict === "Accepted") {
        setIsSolved(true);
        dispatch(fetchUserProfile()); // refresh solved counts in the navbar
      }
    } catch (err) {
      setResult({
        kind: "submit",
        status: "error",
        error: getApiErrorMessage(err, err.message || "Submission failed. Please try again."),
      });
    } finally {
      busyRef.current = false;
      setIsSubmitting(false);
      setSubmissionsRefreshKey((k) => k + 1);
    }
  }, [problem, language, code, dispatch]);

  if (isLoading || loadError) {
    return (
      <div className="h-screen flex flex-col bg-[#121315] text-[#e6e7ea]">
        <ProblemHeader onRun={() => {}} onSubmit={() => {}} isRunning={false} isSubmitting={false} />
        <div className="flex-1 flex items-center justify-center">
          {isLoading ? (
            <div className="animate-spin h-8 w-8 border-3 border-[#e2a24a] border-t-transparent rounded-full" />
          ) : (
            <div className="text-center space-y-3">
              <p className="text-white font-medium">{loadError}</p>
              <Link to="/" className="text-sm text-[#e2a24a] hover:underline">
                Back to the problem list
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#121315] text-[#e6e7ea]">
      <ProblemHeader
        onRun={handleRun}
        onSubmit={handleSubmit}
        isRunning={isRunning}
        isSubmitting={isSubmitting}
      />

      <main className="flex-1 min-h-0 p-2">
        <Group orientation="horizontal" className="h-full">
          {/* Left: Description / Submissions */}
          <Panel defaultSize="45" minSize="25" className="h-full">
            <section className="h-full flex flex-col rounded-lg border border-[#2a2c31] bg-[#18191c] overflow-hidden">
              <div className="h-10 shrink-0 flex items-center gap-1 px-2 border-b border-[#2a2c31]">
                <PanelTab isActive={leftTab === "description"} onClick={() => setLeftTab("description")}>
                  Description
                </PanelTab>
                <PanelTab isActive={leftTab === "submissions"} onClick={() => setLeftTab("submissions")}>
                  Submissions
                </PanelTab>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                {leftTab === "description" ? (
                  <ProblemDescription problem={problem} isSolved={isSolved} />
                ) : (
                  <SubmissionsList
                    problemId={problem._id}
                    refreshKey={submissionsRefreshKey}
                    onLoadCode={handleLoadSubmissionCode}
                  />
                )}
              </div>
            </section>
          </Panel>

          <ResizeHandle orientation="horizontal" />

          {/* Right: Editor on top, console below */}
          <Panel minSize="30" className="h-full">
            <Group orientation="vertical" className="h-full">
              <Panel defaultSize="65" minSize="20" className="h-full">
                <section className="h-full rounded-lg border border-[#2a2c31] bg-[#151619] overflow-hidden">
                  <CodeEditorPanel
                    language={language}
                    code={code}
                    onLanguageChange={handleLanguageChange}
                    onCodeChange={handleCodeChange}
                    onReset={handleReset}
                    onRun={handleRun}
                    onSubmit={handleSubmit}
                  />
                </section>
              </Panel>

              <ResizeHandle orientation="vertical" />

              <Panel minSize="12" className="h-full">
                <section className="h-full rounded-lg border border-[#2a2c31] bg-[#18191c] overflow-hidden">
                  <ConsolePanel
                    testCases={problem.visibleTestCases}
                    activeTab={consoleTab}
                    onTabChange={setConsoleTab}
                    result={result}
                  />
                </section>
              </Panel>
            </Group>
          </Panel>
        </Group>
      </main>
    </div>
  );
}

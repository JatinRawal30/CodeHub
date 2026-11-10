import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { LANGUAGES } from "../../constants/languages";
import { useTheme } from "../../theme/theme";

export default function CodeEditorPanel({ language, code, onLanguageChange, onCodeChange, onReset, onRun, onSubmit }) {
  // Monaco commands are registered once on mount; refs keep them calling the latest handlers
  const runRef = useRef(onRun);
  const submitRef = useRef(onSubmit);
  useEffect(() => {
    runRef.current = onRun;
    submitRef.current = onSubmit;
  }, [onRun, onSubmit]);

  const { theme } = useTheme();

  // Monaco needs literal colors; these mirror the --surface / --surface-hover / --fg-* tokens in index.css
  const handleBeforeMount = (monaco) => {
    monaco.editor.defineTheme("codehub-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#f5f5f5",
        "editor.lineHighlightBackground": "#ececec",
        "editor.lineHighlightBorder": "#ececec",
        "editorLineNumber.foreground": "#94a3b8",
        "editorLineNumber.activeForeground": "#475569",
      },
    });
    monaco.editor.defineTheme("codehub-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#232428",
        "editor.lineHighlightBackground": "#2b2d31",
        "editor.lineHighlightBorder": "#2b2d31",
        "editorLineNumber.foreground": "#52525b",
        "editorLineNumber.activeForeground": "#a1a1aa",
      },
    });
  };

  const handleMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Quote, () => runRef.current());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => submitRef.current());
    editor.focus();
  };

  const monacoLanguage = LANGUAGES.find((l) => l.id === language)?.monaco ?? "plaintext";

  return (
    <div className="h-full flex flex-col">
      <div className="h-9 shrink-0 flex items-center justify-between pl-3 pr-1.5 border-b border-line bg-surface-alt">
        <div className="flex items-center gap-2">
          <span className="text-primary text-code-sm">{"</>"}</span>
          <span className="label-caps text-fg-muted">Code</span>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            aria-label="Language"
            className="input ml-1 w-auto h-7 pl-2 pr-7 text-body-sm cursor-pointer hover:border-fg-subtle"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={onReset}
          title="Reset to starter code"
          className="btn btn-ghost h-7 px-2 text-body-sm"
        >
          ↺ Reset
        </button>
      </div>

      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={monacoLanguage}
          value={code}
          onChange={(value) => onCodeChange(value ?? "")}
          beforeMount={handleBeforeMount}
          onMount={handleMount}
          theme={theme === "dark" ? "codehub-dark" : "codehub-light"}
          loading={<div className="text-body-sm text-fg-muted">Loading editor…</div>}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace",
            minimap: { enabled: false },
            automaticLayout: true, // re-measure when panels are resized
            scrollBeyondLastLine: false,
            tabSize: 4,
            padding: { top: 12 },
          }}
        />
      </div>
    </div>
  );
}

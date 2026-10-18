import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { LANGUAGES } from "../../constants/languages";

export default function CodeEditorPanel({ language, code, onLanguageChange, onCodeChange, onReset, onRun, onSubmit }) {
  // Monaco commands are registered once on mount; refs keep them calling the latest handlers
  const runRef = useRef(onRun);
  const submitRef = useRef(onSubmit);
  useEffect(() => {
    runRef.current = onRun;
    submitRef.current = onSubmit;
  }, [onRun, onSubmit]);

  // vs-dark with the editor background matched to the page surfaces
  const handleBeforeMount = (monaco) => {
    monaco.editor.defineTheme("codehub-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#151619",
        "editor.lineHighlightBackground": "#1a1b1f",
        "editorLineNumber.foreground": "#4a4d55",
        "editorLineNumber.activeForeground": "#9a9ca3",
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
      {/* Toolbar */}
      <div className="h-10 shrink-0 flex items-center justify-between px-3 border-b border-[#2a2c31] bg-[#18191c]">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#68b582] font-mono text-xs">{"</>"}</span>
          <span className="font-medium text-white">Code</span>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            aria-label="Language"
            className="ml-2 bg-transparent text-[#c4c6cb] text-xs rounded-md px-2 py-1 hover:bg-[#202226] outline-none cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id} className="bg-[#1a1b1f]">
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={onReset}
          title="Reset to starter code"
          className="text-xs text-[#9a9ca3] hover:text-white px-2 py-1 rounded-md hover:bg-[#202226] transition-colors cursor-pointer"
        >
          ↺ Reset
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={monacoLanguage}
          value={code}
          onChange={(value) => onCodeChange(value ?? "")}
          beforeMount={handleBeforeMount}
          onMount={handleMount}
          theme="codehub-dark"
          loading={<div className="text-sm text-[#9a9ca3]">Loading editor…</div>}
          options={{
            fontSize: 14,
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

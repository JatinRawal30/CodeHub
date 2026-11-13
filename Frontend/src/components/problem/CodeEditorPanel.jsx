import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { LANGUAGES } from "../../constants/languages";
import { useTheme } from "../../theme/theme";
import { defineEditorThemes, editorThemeName, EDITOR_OPTIONS } from "./editorTheme";

export default function CodeEditorPanel({ language, code, onLanguageChange, onCodeChange, onReset, onRun, onSubmit }) {
  // Monaco commands are registered once on mount; refs keep them calling the latest handlers
  const runRef = useRef(onRun);
  const submitRef = useRef(onSubmit);
  useEffect(() => {
    runRef.current = onRun;
    submitRef.current = onSubmit;
  }, [onRun, onSubmit]);

  const { theme } = useTheme();

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
          beforeMount={defineEditorThemes}
          onMount={handleMount}
          theme={editorThemeName(theme)}
          loading={<div className="text-body-sm text-fg-muted">Loading editor…</div>}
          options={EDITOR_OPTIONS}
        />
      </div>
    </div>
  );
}

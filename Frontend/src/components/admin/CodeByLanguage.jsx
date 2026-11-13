import { useState } from "react";
import Editor from "@monaco-editor/react";
import { LANGUAGES } from "../../constants/languages";
import { useTheme } from "../../theme/theme";
import { defineEditorThemes, editorThemeName, EDITOR_OPTIONS } from "../problem/editorTheme";

// One code editor with a tab per language. `value` is { languageId: code };
// a dot on a tab means that language has code.
export default function CodeByLanguage({ label, value, onChange, hasError = false }) {
  const { theme } = useTheme();
  const [language, setLanguage] = useState(
    () => LANGUAGES.find((l) => value[l.id]?.trim())?.id ?? LANGUAGES[0].id
  );
  const monacoLanguage = LANGUAGES.find((l) => l.id === language).monaco;

  return (
    <div>
      <div role="tablist" aria-label={`${label} language`} className="flex flex-wrap gap-1">
        {LANGUAGES.map((l) => {
          const isActive = l.id === language;
          return (
            <button
              key={l.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setLanguage(l.id)}
              className={`flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors hover:text-fg ${
                isActive ? "bg-surface-hover text-fg" : "text-fg-muted"
              }`}
            >
              {l.label}
              {value[l.id]?.trim() && (
                <>
                  <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
                  <span className="sr-only">(has code)</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      <div className={`mt-3 h-72 overflow-hidden rounded-2xl border bg-surface ${hasError ? "border-danger" : "border-line"}`}>
        <Editor
          height="100%"
          language={monacoLanguage}
          value={value[language] ?? ""}
          onChange={(code) => onChange({ ...value, [language]: code ?? "" })}
          beforeMount={defineEditorThemes}
          theme={editorThemeName(theme)}
          loading={<div className="text-body-sm text-fg-muted">Loading editor…</div>}
          options={EDITOR_OPTIONS}
        />
      </div>
    </div>
  );
}

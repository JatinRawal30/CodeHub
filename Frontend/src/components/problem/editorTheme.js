// Shared Monaco setup for the problem page and the admin problem form.
// Monaco needs literal colors; these mirror the --surface / --surface-hover / --fg-* tokens in index.css
export function defineEditorThemes(monaco) {
  monaco.editor.defineTheme("codehub-light", {
    base: "vs",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#eff1f2",
      "editor.lineHighlightBackground": "#e6e8e9",
      "editor.lineHighlightBorder": "#e6e8e9",
      "editorLineNumber.foreground": "#67747c",
      "editorLineNumber.activeForeground": "#515d65",
    },
  });
  monaco.editor.defineTheme("codehub-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#1f1f1f",
      "editor.lineHighlightBackground": "#242424",
      "editor.lineHighlightBorder": "#242424",
      "editorLineNumber.foreground": "#5f6b74",
      "editorLineNumber.activeForeground": "#92a1a9",
    },
  });
}

export const editorThemeName = (theme) => (theme === "dark" ? "codehub-dark" : "codehub-light");

export const EDITOR_OPTIONS = {
  fontSize: 14,
  fontFamily: "'JetBrains Mono', monospace",
  minimap: { enabled: false },
  automaticLayout: true, // re-measure when panels are resized
  scrollBeyondLastLine: false,
  tabSize: 4,
  padding: { top: 12 },
};

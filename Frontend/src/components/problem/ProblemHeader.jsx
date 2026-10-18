import { Link } from "react-router";
import CodeHubLogo from "../CodeHubLogo";

function ButtonSpinner() {
  return (
    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

export default function ProblemHeader({ onRun, onSubmit, isRunning, isSubmitting }) {
  const isBusy = isRunning || isSubmitting;
  const shortcutKey = navigator.platform?.toLowerCase().includes("mac") ? "⌘" : "Ctrl";

  return (
    <header className="h-12 shrink-0 flex items-center justify-between px-4 bg-[#1a1b1f] border-b border-[#2a2c31]">
      {/* Left: logo + back to list */}
      <div className="flex items-center gap-4">
        <CodeHubLogo size="sm" showText={false} />
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-[#c4c6cb] hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Problem List
        </Link>
      </div>

      {/* Center: Run / Submit */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRun}
          disabled={isBusy}
          title={`Run (${shortcutKey} + ')`}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium bg-[#2c2e33] text-[#e6e7ea] hover:bg-[#33363c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isRunning ? <ButtonSpinner /> : <span className="text-xs">▶</span>}
          Run
        </button>
        <button
          onClick={onSubmit}
          disabled={isBusy}
          title={`Submit (${shortcutKey} + Enter)`}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-[#68b582]/15 text-[#68b582] hover:bg-[#68b582]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isSubmitting && <ButtonSpinner />}
          Submit
        </button>
      </div>

      {/* Right: spacer keeps the buttons centered */}
      <div className="w-[140px]" />
    </header>
  );
}

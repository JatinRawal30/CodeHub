import { Link } from "react-router";
import CodeHubLogo from "../CodeHubLogo";
import { useSelector } from "react-redux";
import ThemeToggle from "../ThemeToggle";
import UserAvatar from "../UserAvatar";

function ButtonSpinner() {
  return (
    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

export default function ProblemHeader({ onRun, onSubmit, isRunning, isSubmitting }) {
  const { user, profile } = useSelector((state) => state.auth);
  const username = profile?.username || user?.username || "Coder";
  const avatar = user?.avatar || profile?.avatar || null;
  const isBusy = isRunning || isSubmitting;
  const shortcutKey = navigator.platform?.toLowerCase().includes("mac") ? "⌘" : "Ctrl";

  return (
    // 1fr | auto | 1fr keeps Run/Submit centered whatever the side widths are
    <header className="h-12 shrink-0 grid grid-cols-[1fr_auto_1fr] items-center px-4 bg-surface border-b border-line">
      <div className="flex items-center gap-4">
        <CodeHubLogo size="sm" />
        <Link
          to="/"
          className="flex items-center gap-1.5 h-8 px-2 -ml-2 rounded-md text-body-md font-medium text-fg-muted hover:text-fg hover:bg-surface-hover transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Problem List
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRun}
          disabled={isBusy}
          title={`Run (${shortcutKey} + ')`}
          className="btn btn-secondary btn-sm gap-1.5"
        >
          {isRunning ? <ButtonSpinner /> : <span className="text-[10px] text-fg-muted">▶</span>}
          Run
        </button>
        <button
          onClick={onSubmit}
          disabled={isBusy}
          title={`Submit (${shortcutKey} + Enter)`}
          className="btn btn-accent btn-sm gap-1.5"
        >
          {isSubmitting && <ButtonSpinner />}
          Submit
        </button>
      </div>

      <div className="flex items-center justify-end gap-3">
        <ThemeToggle />
        <Link to={`/u/${username}`} aria-label="Your profile" className="rounded-full">
          <UserAvatar src={avatar} name={username} size={32} className="rounded-full" />
        </Link>
      </div>
    </header>
  );
}

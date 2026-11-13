import { useState, useRef, useEffect, useId } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router";
import UserAvatar from "./UserAvatar";
import { searchUsers } from "../api/profile";
import { getApiErrorMessage } from "../api/execution";

const isMac =
  typeof navigator !== "undefined" &&
  navigator.platform?.toLowerCase().includes("mac");

function SearchIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

// Bolds the part of `text` the query matched (search is a prefix match)
function Match({ text, query, className }) {
  if (!text.toLowerCase().startsWith(query.toLowerCase())) return text;
  return (
    <>
      <span className={className}>{text.slice(0, query.length)}</span>
      {text.slice(query.length)}
    </>
  );
}

// Navbar search for other users. ⌘K / Ctrl K focuses it; below lg it collapses to an icon
// that opens the field across the whole navbar.
export default function UserSearch() {
  const navigate = useNavigate();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // mobile only
  const [activeIndex, setActiveIndex] = useState(-1);
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  const trimmed = query.trim();

  // debounced so typing doesn't send a request per keystroke; stale requests are aborted
  useEffect(() => {
    if (!trimmed) {
      setResults([]);
      setStatus("idle");
      return;
    }
    const controller = new AbortController();
    setStatus("loading");
    const timer = setTimeout(async () => {
      try {
        setResults(await searchUsers(trimmed, controller.signal));
        setActiveIndex(-1);
        setStatus("done");
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(getApiErrorMessage(err, "Search failed. Try again."));
        setStatus("error");
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  // Render the mobile field before focusing it; focus must stay inside the tap or iOS won't open the keyboard
  const expandAndFocus = () => {
    flushSync(() => {
      setIsExpanded(true);
      setIsOpen(true);
    });
    inputRef.current?.focus();
  };

  // ⌘K / Ctrl K, except while typing somewhere else (the code editor uses ⌘K chords)
  useEffect(() => {
    function handleShortcut(e) {
      if (e.key.toLowerCase() !== "k" || !(isMac ? e.metaKey : e.ctrlKey))
        return;
      const target = e.target;
      if (
        target !== inputRef.current &&
        target.closest?.("input, textarea, select, [contenteditable='true']")
      )
        return;
      e.preventDefault();
      expandAndFocus();
    }
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (!isOpen && !isExpanded) return;
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isExpanded]);

  const close = () => {
    setIsOpen(false);
    setIsExpanded(false);
    inputRef.current?.blur();
  };

  const openProfile = (username) => {
    setQuery("");
    close();
    navigate(`/u/${username}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (!results.length || status !== "done") return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      openProfile(results[Math.max(activeIndex, 0)].username);
    }
  };

  const showPanel = isOpen && Boolean(trimmed);
  const optionId = (i) => `${listId}-${i}`;

  return (
    <>
      <button
        type="button"
        onClick={expandAndFocus}
        aria-label="Search users"
        className="lg:hidden btn btn-ghost btn-icon"
      >
        <SearchIcon className="w-[18px] h-[18px]" />
      </button>

      <div
        ref={boxRef}
        className={`${isExpanded ? "flex" : "hidden"} lg:flex items-center gap-2
          absolute inset-0 z-50 px-4 bg-canvas
          lg:static lg:z-auto lg:px-0 lg:bg-transparent lg:border-0`}
      >
        <div
          className="group relative flex-1 lg:flex-none lg:w-56 xl:w-72">
          <SearchIcon className="w-4 h-4 text-fg-muted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-label="Search users"
            aria-autocomplete="list"
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-activedescendant={
              showPanel && activeIndex >= 0 ? optionId(activeIndex) : undefined
            }
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            placeholder="Search users…"
            value={query}
            maxLength={20}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="input h-10 pl-10.5 pr-14 border-transparent focus:border-transparent focus:shadow-none"
          />

          {/* right slot: spinner while searching, clear once there's text, otherwise the shortcut */}
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
            {status === "loading" ? (
              <span
                className="spinner w-3.5 h-3.5 mr-1 text-fg-subtle"
                role="status"
                aria-label="Searching"
              />
            ) : query ? (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="w-6 h-6 inline-flex items-center justify-center rounded-full text-fg-subtle hover:text-fg hover:bg-surface-hover cursor-pointer"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            ) : (
              <kbd
                className="hidden lg:inline font-mono text-[0.7rem] text-fg-subtle group-focus-within:opacity-0 transition-opacity"
                aria-hidden="true"
              >
                {isMac ? "⌘K" : "Ctrl K"}
              </kbd>
            )}
          </div>

          {showPanel && (
            <div className="popover bg-surface absolute top-full mt-2 left-0 right-0 lg:left-auto lg:w-80 overflow-hidden">
              {status === "error" ? (
                <p
                  className="px-3 py-3 text-body-sm text-danger-fg"
                  role="alert"
                >
                  {error}
                </p>
              ) : status === "done" && results.length === 0 ? (
                <div className="px-3 py-3">
                  <p className="text-body-sm text-fg">
                    No users match{" "}
                    <span className="font-medium">“{trimmed}”</span>
                  </p>
                  <p className="text-body-sm text-fg-muted mt-0.5">
                    Search by username or first name.
                  </p>
                </div>
              ) : results.length === 0 ? (
                <p className="px-3 py-3 text-body-sm text-fg-muted">
                  Searching…
                </p>
              ) : (
                <ul
                  id={listId}
                  role="listbox"
                  aria-label="Users"
                  className={`p-1 transition-opacity ${status === "loading" ? "opacity-60" : ""}`}
                >
                  {results.map((u, i) => {
                    const isActive = i === activeIndex;
                    return (
                      <li
                        key={u.username}
                        id={optionId(i)}
                        role="option"
                        aria-selected={isActive}
                        onMouseDown={(e) => e.preventDefault()} // keep focus in the input so the click lands
                        onClick={() => openProfile(u.username)}
                        onMouseMove={() => setActiveIndex(i)}
                        className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer ${
                          isActive ? "bg-surface-hover" : ""
                        }`}
                      >
                        <UserAvatar
                          src={u.avatar}
                          name={u.username}
                          size={28}
                          className="rounded-full border border-line"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-body-sm font-medium text-fg truncate">
                            <Match
                              text={u.name || u.username}
                              query={trimmed}
                              className="font-semibold"
                            />
                          </div>
                          <div className="text-code-sm text-fg-muted truncate">
                            @
                            <Match
                              text={u.username}
                              query={trimmed}
                              className="text-fg"
                            />
                          </div>
                        </div>
                        <span className="shrink-0 text-xs text-fg-muted">
                          <span className="text-code-sm text-fg-body">
                            {u.solved}
                          </span>{" "}
                          solved
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}

              {results.length > 0 && status !== "error" && (
                <div className="hidden lg:flex items-center gap-3 px-3 py-2 border-t border-line bg-surface-alt text-xs text-fg-muted">
                  <span className="flex items-center gap-1">
                    <kbd className="kbd">↑</kbd>
                    <kbd className="kbd">↓</kbd> to move
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="kbd">↵</kbd> to open
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="kbd">esc</kbd> to close
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={close}
          className="lg:hidden btn btn-ghost btn-sm"
        >
          Cancel
        </button>
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import ProblemFilters, { Segmented } from "../ProblemFilters";
import Pagination from "../Pagination";
import ConfirmDialog from "./ConfirmDialog";
import api from "../../api/axios";
import { deleteProblem } from "../../api/admin";
import { getApiErrorMessage } from "../../api/execution";

const PAGE_SIZE = 10;

// id | title | level | topics | actions; level and topics only from md up.
// Fixed widths, because the header and each row are separate grids and must line up.
const COLUMNS = "grid grid-cols-[2.5rem_1fr_8rem] items-center gap-x-4 px-4 md:grid-cols-[2.5rem_1fr_6rem_14rem_8rem]";

const SCOPES = [
  ["all", "All"],
  ["mine", "Created by me"],
];

const LEVEL = {
  easy: { text: "text-success-fg", dot: "bg-success" },
  medium: { text: "text-warning-fg", dot: "bg-warning" },
  hard: { text: "text-danger-fg", dot: "bg-danger" },
};

export default function ProblemManager() {
  const location = useLocation();

  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [scope, setScope] = useState("all"); // "all" | "mine" (problems this admin created)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProblems, setTotalProblems] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  // the problem form comes back here with what it just saved
  const [notice, setNotice] = useState(location.state?.notice ? { type: "success", text: location.state.notice } : null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProblems() {
      setIsLoading(true);
      setLoadError("");
      try {
        if (scope === "mine") {
          // shortcut: /problems/user returns the admin's whole list with no filters or paging, so they are
          // applied here and the list is re-fetched on every change; move them to the API if the list gets large
          const res = await api.get("/problems/user");
          if (!isMounted) return;
          const query = searchQuery.trim().toLowerCase();
          const mine = (res.data.problems || []).filter(
            (prob) =>
              (selectedDifficulty === "all" || prob.difficulty === selectedDifficulty) &&
              prob.title.toLowerCase().includes(query)
          );
          setProblems(mine.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE));
          setTotalPages(Math.max(1, Math.ceil(mine.length / PAGE_SIZE)));
          setTotalProblems(mine.length);
          return;
        }

        const params = { page: currentPage, limit: PAGE_SIZE };
        if (selectedDifficulty !== "all") params.difficulty = selectedDifficulty;
        if (searchQuery.trim()) params.search = searchQuery.trim();

        const res = await api.get("/problems", { params });
        if (!isMounted) return;
        setProblems(res.data.problems || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalProblems(res.data.pagination?.totalProblems || 0);
      } catch (err) {
        if (isMounted) setLoadError(getApiErrorMessage(err, "Couldn't load the problems."));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    const timer = setTimeout(loadProblems, searchQuery ? 300 : 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [currentPage, selectedDifficulty, searchQuery, scope, reloadKey]);

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProblem(pendingDelete.problemID);
      setNotice({ type: "success", text: `Deleted “${pendingDelete.title}”.` });
      // deleting the only row on a page: step back so the list isn't left empty
      if (problems.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
      else setReloadKey((key) => key + 1);
    } catch (err) {
      setNotice({ type: "error", text: getApiErrorMessage(err, "Couldn't delete the problem.") });
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  };

  const hasFilters = Boolean(searchQuery || selectedDifficulty !== "all");

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <p className="text-body-md text-fg-muted" aria-live="polite">
            {isLoading ? "Loading…" : `${totalProblems} ${totalProblems === 1 ? "problem" : "problems"}${hasFilters ? " match" : ""}`}
          </p>
          <Segmented
            label="Show"
            options={SCOPES}
            value={scope}
            onChange={(value) => {
              setScope(value);
              setCurrentPage(1);
            }}
          />
        </div>
        <Link to="/admin/problems/new" className="btn btn-primary hover:brightness-105">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New problem
        </Link>
      </div>

      {notice && (
        <div className={`alert mb-6 ${notice.type === "error" ? "alert-error" : "alert-success"}`} role={notice.type === "error" ? "alert" : "status"}>
          <span className="flex-1">{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} className="cursor-pointer font-medium underline-offset-2 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <ProblemFilters
        searchQuery={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setCurrentPage(1);
        }}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={(value) => {
          setSelectedDifficulty(value);
          setCurrentPage(1);
        }}
      />

      <div className={`${COLUMNS} mt-8 hidden pb-3 text-xs uppercase tracking-[0.18em] text-fg-subtle md:grid`}>
        <span className="text-right">ID</span>
        <span>Title</span>
        <span>Level</span>
        <span>Topics</span>
        <span className="pl-3.5">Actions</span>
      </div>

      <ul className="mt-6 md:mt-0" aria-busy={isLoading}>
        {isLoading ? (
          [...Array(PAGE_SIZE)].map((_, i) => (
            <li key={i} className={`${COLUMNS} animate-pulse py-3`} aria-hidden="true">
              <span />
              <span className="h-8 w-2/3 rounded-full bg-surface-hover" />
            </li>
          ))
        ) : loadError ? (
          <li className="py-16 text-center">
            <p className="text-body-md text-danger-fg">{loadError}</p>
            <button type="button" className="btn btn-secondary btn-sm mt-4" onClick={() => setReloadKey((key) => key + 1)}>
              Try again
            </button>
          </li>
        ) : problems.length === 0 ? (
          <li className="py-16 text-center text-body-lg text-fg-muted">
            {hasFilters
              ? "No problems match these filters."
              : scope === "mine"
                ? "You haven't created any problems yet."
                : "No problems yet. Add the first one with New problem."}
          </li>
        ) : (
          problems.map((prob) => {
            const level = LEVEL[prob.difficulty] || LEVEL.medium;
            return (
              <li key={prob._id} className={`${COLUMNS} rounded-2xl py-2 transition-colors hover:bg-surface`}>
                <span className="text-right font-mono text-xs text-fg-subtle">{prob.problemID}</span>
                <Link
                  to={`/problems/${prob.problemID}`}
                  title="Open the problem page"
                  className="truncate font-display text-base font-medium text-fg transition-colors hover:text-primary"
                >
                  {prob.title}
                </Link>
                <span className={`hidden items-center gap-2 text-sm capitalize md:flex ${level.text}`}>
                  <span className={`size-1.5 rounded-full ${level.dot}`} />
                  {prob.difficulty}
                </span>
                <span className="hidden truncate font-display text-sm text-fg-muted md:block">
                  {(prob.tags || []).join(" · ")}
                </span>
                <span className="flex gap-1">
                  <Link
                    to={`/admin/problems/${prob.problemID}`}
                    aria-label={`Edit ${prob.title}`}
                    className="btn btn-ghost btn-sm hover:bg-surface-hover hover:text-fg"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    aria-label={`Delete ${prob.title}`}
                    onClick={() => setPendingDelete(prob)}
                    className="btn btn-ghost btn-sm enabled:hover:bg-danger-soft enabled:hover:text-danger-fg"
                  >
                    Delete
                  </button>
                </span>
              </li>
            );
          })
        )}
      </ul>

      <div className="mt-10">
        <Pagination currentPage={currentPage} totalPages={totalPages} isLoading={isLoading} onPageChange={setCurrentPage} />
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete “${pendingDelete?.title ?? ""}”?`}
        body="This removes the problem and its test cases for everyone. It can't be undone."
        confirmLabel="Delete problem"
        isBusy={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  );
}

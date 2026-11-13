import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router";
import UserAvatar from "./UserAvatar";
import Pagination from "./Pagination";
import { Segmented } from "./ProblemFilters";
import { fetchLeaderboard } from "../api/profile";
import { getApiErrorMessage } from "../api/execution";
import { getLanguageLabel } from "../constants/languages";
import { timeAgo } from "../utils/timeAgo";

const PERIODS = [
  ["all", "All time"],
  ["month", "30 days"],
  ["week", "7 days"],
];

const RANKED_BY = {
  all: "Ranked by problems solved.",
  month: "Ranked by problems first solved in the last 30 days.",
  week: "Ranked by problems first solved in the last 7 days.",
};

// rank | user | solved | easy · med · hard | accepted | language | last solve.
// Phones show the first three; the split joins from md and the rest from lg.
const COLUMNS =
  "grid grid-cols-[2.5rem_1fr_3.5rem] items-center gap-x-4 px-4 md:grid-cols-[2.5rem_1fr_4.5rem_10rem] lg:grid-cols-[2.5rem_1fr_4.5rem_10rem_6rem_7rem_7rem]";

function VerifiedTick() {
  return (
    <svg className="size-3.5 shrink-0 text-success-fg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Verified">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function Row({ row, isMe = false }) {
  const dot = <span className="text-fg-subtle"> · </span>;
  return (
    <Link
      to={`/u/${row.username}`}
      className={`group ${COLUMNS} rounded-2xl py-3 transition-colors ${isMe ? "bg-primary-soft" : "hover:bg-surface"}`}
    >
      <span className={`text-right font-mono text-sm ${row.rank <= 3 ? "font-medium text-brand-ink" : "text-fg-subtle"}`}>
        {row.rank}
      </span>
      <span className="flex min-w-0 items-center gap-3">
        <UserAvatar src={row.avatar} name={row.username} size={36} className="rounded-full" />
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-display text-base font-medium text-fg transition-colors group-hover:text-primary">
              {row.name || row.username}
            </span>
            {row.isVerified && <VerifiedTick />}
            {isMe && <span className="badge badge-info shrink-0">You</span>}
          </span>
          <span className="block truncate font-mono text-xs text-fg-subtle">@{row.username}</span>
        </span>
      </span>
      <span className="font-mono text-base text-fg">{row.solved}</span>
      <span className="hidden font-mono text-sm md:block">
        <span className="text-success-fg">{row.easy}</span>
        {dot}
        <span className="text-warning-fg">{row.medium}</span>
        {dot}
        <span className="text-danger-fg">{row.hard}</span>
      </span>
      <span className="hidden font-mono text-sm text-fg-muted lg:block">
        {row.acceptanceRate == null ? "—" : `${row.acceptanceRate}%`}
      </span>
      <span className="hidden truncate text-sm text-fg-muted lg:block">
        {row.topLanguage ? getLanguageLabel(row.topLanguage) : "—"}
      </span>
      <span className="hidden truncate text-sm text-fg-muted lg:block" title={new Date(row.lastSolvedAt).toLocaleString()}>
        {timeAgo(row.lastSolvedAt)}
      </span>
    </Link>
  );
}

export default function Leaderboard() {
  const { user } = useSelector((state) => state.auth);

  const [period, setPeriod] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const query = search.trim();

  // debounced while typing; a request that is no longer wanted is aborted
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        setData(await fetchLeaderboard({ period, page, search: query }, controller.signal));
        setError("");
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(getApiErrorMessage(err, "Couldn't load the leaderboard."));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, query ? 300 : 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [period, page, query]);

  const rows = data?.rows ?? [];
  // the first three get the podium on the opening page; the list carries on from fourth
  const hasPodium = page === 1 && !query && rows.length >= 3;
  const podium = hasPodium ? rows.slice(0, 3) : [];
  const listRows = hasPodium ? rows.slice(3) : rows;

  const unrankedNote =
    user?.role === "admin"
      ? "Admin accounts aren't ranked."
      : period === "all"
        ? "You're not on the board yet. Solve a problem to appear here."
        : "You haven't solved a new problem in this period.";

  return (
    <>
      <section className="fade-up max-w-2xl pt-16">
        <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">Leaderboard</h1>
        <p className="mt-5 text-lg leading-relaxed text-fg-muted">
          {RANKED_BY[period]} Ties share a rank.
        </p>
      </section>

      <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
        <label className="flex h-11 min-w-0 flex-1 basis-72 items-center gap-3 rounded-full bg-surface px-5 text-fg-muted transition-colors focus-within:bg-surface-hover">
          <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="text"
            aria-label="Search the leaderboard by username"
            placeholder="Search by username…"
            value={search}
            maxLength={20}
            spellCheck={false}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-transparent text-base text-fg outline-none placeholder:text-fg-muted"
          />
        </label>
        <Segmented
          label="Period"
          options={PERIODS}
          value={period}
          onChange={(value) => {
            setPeriod(value);
            setPage(1);
          }}
        />
      </div>

      {error ? (
        <p className="alert alert-error mt-10 max-w-xl" role="alert">
          {error}
        </p>
      ) : !data ? (
        <ul className="mt-10" aria-busy="true">
          {[...Array(8)].map((_, i) => (
            <li key={i} className={`${COLUMNS} animate-pulse py-3`} aria-hidden="true">
              <span />
              <span className="flex items-center gap-3">
                <span className="size-9 shrink-0 rounded-full bg-surface-hover" />
                <span className="h-5 w-40 rounded-full bg-surface-hover" />
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className={`transition-opacity ${isLoading ? "opacity-60" : ""}`} aria-busy={isLoading}>
          <section aria-label="Your rank" className="mt-10">
            <h2 className="mb-2 px-4 text-xs font-normal uppercase tracking-[0.18em] text-fg-subtle">Your rank</h2>
            {data.me ? <Row row={data.me} isMe /> : <p className="px-4 text-base text-fg-muted">{unrankedNote}</p>}
          </section>

          {podium.length > 0 && (
            <ol aria-label="Top three" className="mt-10 grid gap-3 sm:grid-cols-3">
              {podium.map((row) => (
                <li key={row.username}>
                  <Link
                    to={`/u/${row.username}`}
                    className="group flex items-center gap-4 rounded-2xl bg-surface px-5 py-4 transition-colors hover:bg-surface-hover"
                  >
                    <span className={`w-7 shrink-0 font-display text-3xl font-semibold ${row.rank === 1 ? "text-brand-ink" : "text-fg-muted"}`}>
                      {row.rank}
                    </span>
                    <UserAvatar src={row.avatar} name={row.username} size={48} className="rounded-full" />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate font-display text-lg font-medium text-fg transition-colors group-hover:text-primary">
                          {row.name || row.username}
                        </span>
                        {row.isVerified && <VerifiedTick />}
                      </span>
                      <span className="block text-sm text-fg-muted">
                        <span className="font-mono text-fg">{row.solved}</span> solved
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}

          {rows.length === 0 ? (
            <p className="py-20 text-center text-base text-fg-muted">
              {query
                ? `No ranked user matches “${query}”.`
                : period === "all"
                  ? "No one is on the board yet. The first solve takes first place."
                  : "No one has solved a new problem in this period."}
            </p>
          ) : (
            listRows.length > 0 && (
              <>
                <div className={`${COLUMNS} mt-10 pb-3 text-xs uppercase tracking-[0.18em] text-fg-subtle`}>
                  <span className="text-right">#</span>
                  <span>User</span>
                  <span>Solved</span>
                  <span className="hidden md:block">Easy · Med · Hard</span>
                  <span className="hidden lg:block">Accepted</span>
                  <span className="hidden lg:block">Language</span>
                  <span className="hidden lg:block">Last solve</span>
                </div>
                <ol>
                  {listRows.map((row) => (
                    <li key={row.username}>
                      <Row row={row} isMe={row.username === user?.username} />
                    </li>
                  ))}
                </ol>
              </>
            )
          )}

          <div className="mt-12">
            <Pagination
              currentPage={data.pagination.currentPage}
              totalPages={data.pagination.totalPages}
              isLoading={isLoading}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </>
  );
}

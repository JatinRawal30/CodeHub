import { useState, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation, useSearchParams } from "react-router";
import Navbar from "../components/Navbar";
import TopicSlider from "../components/TopicSlider";
import ProblemFilters from "../components/ProblemFilters";
import ProblemList from "../components/ProblemList";
import Leaderboard from "../components/Leaderboard";
import Pagination from "../components/Pagination";
import SettingsModal from "../components/SettingsModal";
import api from "../api/axios";
import { TOPICS } from "../constants/topics";
import { fetchUserProfile } from "../store/slices/authSlice";

const PAGE_SIZE = 10;

// Placeholder for the sections that aren't built yet
function QuietSection({ label, title, body, onBack }) {
  return (
    <section className="fade-up mx-auto flex max-w-xl flex-col items-center pt-32 text-center">
      <p className="mb-4 text-sm uppercase tracking-[0.2em] text-primary">{label}</p>
      <h1 className="font-display text-5xl font-semibold tracking-tight text-balance">{title}</h1>
      <p className="mt-5 text-lg text-fg-muted">{body}</p>
      <button
        type="button"
        onClick={onBack}
        className="mt-10 cursor-pointer rounded-full bg-gradient-primary px-6 py-3 text-base font-medium text-primary-fg shadow-glow transition-transform hover:-translate-y-0.5 motion-reduce:transition-none"
      >
        Back to problems
      </button>
    </section>
  );
}

export default function Homepage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, profile } = useSelector((state) => state.auth);

  // 'problems' | 'contest' | 'leaderboard'.
  // Other pages can open a tab via navigate("/", { state: { section } })
  const [activeSection, setActiveSection] = useState(location.state?.section || "problems");

  const [problems, setProblems] = useState([]);
  const [solvedProblemIds, setSolvedProblemIds] = useState(new Set());
  const [tagCounts, setTagCounts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProblems, setTotalProblems] = useState(0);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // the topic card that was opened lives in the URL (?topic=graphs), so it can be linked and survives Back
  const topicSlug = searchParams.get("topic");
  const topic = TOPICS.find((t) => t.slug === topicSlug);
  const listRef = useRef(null);

  // a different topic starts back at page 1 (reset during render, so only one request goes out)
  const [shownTopic, setShownTopic] = useState(topicSlug);
  if (shownTopic !== topicSlug) {
    setShownTopic(topicSlug);
    setCurrentPage(1);
  }

  // opening a topic card glides down to the list
  const isFirstRender = useRef(true);
  useEffect(() => {
    const wasFirstRender = isFirstRender.current;
    isFirstRender.current = false;
    if (!topic || (wasFirstRender && activeSection !== "problems")) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    listRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the topic changes
  }, [topicSlug]);

  useEffect(() => {
    let isMounted = true;
    async function loadSolved() {
      try {
        const solvedRes = await api.get("/problems/solved");
        if (isMounted && solvedRes.data?.solvedProblems) {
          const solvedIds = new Set(
            solvedRes.data.solvedProblems.map((p) => p._id?.toString() || p.id?.toString())
          );
          setSolvedProblemIds(solvedIds);
        }
      } catch (err) {
        console.error("Failed to load solved problems:", err);
      }
    }

    // non-critical: the topic cards say "Browse" until the counts arrive
    api
      .get("/problems/tag-counts")
      .then((res) => isMounted && setTagCounts(res.data?.counts || null))
      .catch((err) => console.error("Failed to load topic counts:", err));

    loadSolved();
    dispatch(fetchUserProfile());

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const topicTag = topic?.tag;
  useEffect(() => {
    let isMounted = true;

    async function loadProblems() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(PAGE_SIZE),
        });

        if (selectedDifficulty !== "all") {
          params.append("difficulty", selectedDifficulty);
        }

        if (topicTag) {
          params.append("tags", topicTag);
        }

        if (searchQuery.trim()) {
          params.append("search", searchQuery.trim());
        }

        const res = await api.get(`/problems?${params.toString()}`);
        if (isMounted && res.data) {
          if (res.data.problems) {
            setProblems(res.data.problems);
          }
          if (res.data.pagination) {
            setTotalPages(res.data.pagination.totalPages || 1);
            setTotalProblems(res.data.pagination.totalProblems || 0);
          }
        }
      } catch (err) {
        console.error("Failed to load problems:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    const timer = setTimeout(
      () => {
        loadProblems();
      },
      searchQuery ? 300 : 0
    );

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [currentPage, selectedDifficulty, searchQuery, topicTag]);

  // a new search or difficulty starts back at page 1
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleDifficultyChange = (val) => {
    setSelectedDifficulty(val);
    setCurrentPage(1);
  };

  // solved/unsolved is filtered client-side, on the current page only
  const filteredProblems = useMemo(() => {
    return problems.filter((prob) => {
      const isSolved = solvedProblemIds.has(prob._id?.toString());
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "solved" && isSolved) ||
        (selectedStatus === "unsolved" && !isSolved);

      return matchesStatus;
    });
  }, [problems, selectedStatus, solvedProblemIds]);

  const totalSolvedCount =
    profile?.solvedStats?.totalSolved ?? solvedProblemIds.size;

  const hasFilters = Boolean(searchQuery || topic || selectedDifficulty !== "all" || selectedStatus !== "all");

  return (
    <div className="min-h-screen bg-canvas text-fg">
      <Navbar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        {activeSection === "problems" && (
          <>
            <section className="fade-up max-w-2xl pt-16">
              <p className="mb-4 text-sm uppercase tracking-[0.2em] text-primary">Breathe in. Code out.</p>
              <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
                Welcome to Code<span className="text-brand-ink">Hub</span>
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-fg-muted">
                Practice coding interview questions, sharpen algorithmic skills, and compete with peers — one calm
                problem at a time.
              </p>
            </section>

            <TopicSlider counts={tagCounts} />

            <section ref={listRef} id="problems" className="mt-16 scroll-mt-24">
              {topic && (
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <span className="text-xs uppercase tracking-[0.18em] text-fg-subtle">Topic</span>
                  <span className="font-display text-lg font-medium text-primary">{topic.title}</span>
                  {!isLoading && <span className="text-sm text-fg-muted">· {totalProblems} problems</span>}
                  <Link
                    to={{ search: "" }}
                    preventScrollReset
                    className="ml-1 flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-sm text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
                  >
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                    Show all
                  </Link>
                </div>
              )}

              <ProblemFilters
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                selectedDifficulty={selectedDifficulty}
                onDifficultyChange={handleDifficultyChange}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
              />

              <ProblemList
                problems={filteredProblems}
                solvedProblemIds={solvedProblemIds}
                isLoading={isLoading}
                hasFilters={hasFilters}
                pageSize={PAGE_SIZE}
              />

              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  isLoading={isLoading}
                  onPageChange={setCurrentPage}
                />
              </div>
            </section>
          </>
        )}

        {activeSection === "contest" && (
          <QuietSection
            label="Contest"
            title="The next round is warming up"
            body="Weekly contests will appear here. Until then, keep your streak gentle and steady."
            onBack={() => setActiveSection("problems")}
          />
        )}

        {activeSection === "leaderboard" && <Leaderboard />}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        profile={profile}
        totalSolvedCount={totalSolvedCount}
      />
    </div>
  );
}

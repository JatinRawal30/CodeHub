import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router";
import Navbar from "../components/Navbar";
import ProblemFilters from "../components/ProblemFilters";
import ProblemTable from "../components/ProblemTable";
import Pagination from "../components/Pagination";
import SettingsModal from "../components/SettingsModal";
import api from "../api/axios";
import { fetchUserProfile } from "../store/slices/authSlice";

export default function Homepage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, profile } = useSelector((state) => state.auth);

  // 'problems' | 'contest' | 'chat'.
  // Other pages can open a tab via navigate("/", { state: { section } })
  const [activeSection, setActiveSection] = useState(location.state?.section || "problems");

  const [problems, setProblems] = useState([]);
  const [solvedProblemIds, setSolvedProblemIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProblems, setTotalProblems] = useState(0);
  const limit = 10;

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

    loadSolved();
    dispatch(fetchUserProfile());

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;

    async function loadProblems() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(limit),
        });

        if (selectedDifficulty !== "all") {
          params.append("difficulty", selectedDifficulty);
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
  }, [currentPage, selectedDifficulty, searchQuery]);

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

  return (
    <div className="min-h-screen bg-dot-grid text-fg-body flex flex-col">
      <Navbar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeSection === "problems" && (
          <div className="space-y-6">
            <div className="card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-headline-md text-fg">
                  Welcome to Code<span className="text-warning">Hub</span>
                </h1>
                <p className="text-body-md text-fg-muted mt-1">
                  Practice coding interview questions, sharpen algorithmic skills, and compete with peers.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-surface-alt border border-line px-4 py-2.5 rounded-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-body-sm text-fg-muted">Solved:</span>
                  <span className="text-code-md text-fg">
                    {totalSolvedCount}
                  </span>
                </div>
                <div className="h-4 w-px bg-line" />
                <div className="text-body-sm text-fg-muted">
                  Total Available:{" "}
                  <span className="text-code-md text-fg">
                    {totalProblems || problems.length}
                  </span>
                </div>
              </div>
            </div>

            <ProblemFilters
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              selectedDifficulty={selectedDifficulty}
              onDifficultyChange={handleDifficultyChange}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
            />

            <div className="card overflow-hidden">
              <ProblemTable
                problems={filteredProblems}
                solvedProblemIds={solvedProblemIds}
                isLoading={isLoading}
                searchQuery={searchQuery}
                selectedDifficulty={selectedDifficulty}
                selectedStatus={selectedStatus}
              />

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                isLoading={isLoading}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}

        {activeSection === "contest" && (
          <div className="card p-8 text-center max-w-2xl mx-auto my-12 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-lg bg-primary-soft border border-primary-soft-line flex items-center justify-center text-2xl">
              🏆
            </div>
            <h2 className="text-headline-md text-fg">Contests Arena</h2>
            <p className="text-body-md text-fg-muted">
              Weekly and Biweekly coding challenges with real-time global leaderboard and ratings will be hosted here.
            </p>
            <div className="pt-2">
              <span className="badge badge-info">
                Coming Soon
              </span>
            </div>
          </div>
        )}

        {activeSection === "chat" && (
          <div className="card p-8 text-center max-w-2xl mx-auto my-12 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-lg bg-success-soft border border-success-line flex items-center justify-center text-2xl">
              💬
            </div>
            <h2 className="text-headline-md text-fg">CodeHub Chat Room</h2>
            <p className="text-body-md text-fg-muted">
              Connect in real-time with fellow coders, discuss problems, share optimal algorithms, and pair program.
            </p>
            <div className="pt-2">
              <span className="badge badge-success">
                Live Discussion Space
              </span>
            </div>
          </div>
        )}
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
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

  // Active top-nav tab: 'problems' (default), 'contest', 'chat'.
  // Other pages (e.g. the profile) can open a tab via navigate("/", { state: { section } })
  const [activeSection, setActiveSection] = useState(location.state?.section || "problems");

  // Problems & Solved State
  const [problems, setProblems] = useState([]);
  const [solvedProblemIds, setSolvedProblemIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProblems, setTotalProblems] = useState(0);
  const limit = 10;

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Fetch solved problem IDs once on mount
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

  // Fetch paginated problems when currentPage, selectedDifficulty, or searchQuery changes
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

  // Reset to page 1 on search or difficulty change
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleDifficultyChange = (val) => {
    setSelectedDifficulty(val);
    setCurrentPage(1);
  };

  // Filter problems for solved/unsolved status
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
    <div className="min-h-screen bg-[#121315] text-[#e6e7ea] flex flex-col font-leetcode antialiased">
      {/* 1. Navigation Bar */}
      <Navbar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeSection === "problems" && (
          <div className="space-y-6">
            {/* 2. Welcome & Stats Quick Glance Banner */}
            <div className="bg-[#1a1b1f] border border-[#2a2c31] rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-white">
                  Welcome to CodeHub
                </h1>
                <p className="text-sm text-[#9a9ca3] mt-1">
                  Practice coding interview questions, sharpen algorithmic skills, and compete with peers.
                </p>
              </div>

              {/* Solved & Total Count Summary */}
              <div className="flex items-center gap-3 bg-[#151619] border border-[#202226] px-4 py-2.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#5fb39f] animate-pulse" />
                  <span className="text-xs text-[#9a9ca3]">Solved:</span>
                  <span className="text-sm font-bold text-white tabular-nums">
                    {totalSolvedCount}
                  </span>
                </div>
                <div className="h-4 w-[1px] bg-[#2a2c31]" />
                <div className="text-xs text-[#9a9ca3]">
                  Total Available:{" "}
                  <span className="text-white font-semibold tabular-nums">
                    {totalProblems || problems.length}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Filter & Search Toolbar Component */}
            <ProblemFilters
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              selectedDifficulty={selectedDifficulty}
              onDifficultyChange={handleDifficultyChange}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
            />

            {/* 4. Problems Table & Pagination Container */}
            <div className="bg-[#18191c] border border-[#2a2c31] rounded-xl overflow-hidden shadow-lg">
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
                totalProblems={totalProblems}
                limit={limit}
                isLoading={isLoading}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}

        {/* 5. Contest Tab */}
        {activeSection === "contest" && (
          <div className="bg-[#1a1b1f] border border-[#2a2c31] rounded-xl p-8 text-center max-w-2xl mx-auto my-12 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#e2a24a]/10 border border-[#e2a24a]/20 flex items-center justify-center text-2xl text-[#e2a24a]">
              🏆
            </div>
            <h2 className="text-2xl font-bold text-white">Contests Arena</h2>
            <p className="text-sm text-[#9a9ca3] leading-relaxed">
              Weekly and Biweekly coding challenges with real-time global leaderboard and ratings will be hosted here.
            </p>
            <div className="pt-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-[#e2a24a] bg-[#e2a24a]/10 border border-[#e2a24a]/30">
                Coming Soon
              </span>
            </div>
          </div>
        )}

        {/* 6. Chat Room Tab */}
        {activeSection === "chat" && (
          <div className="bg-[#1a1b1f] border border-[#2a2c31] rounded-xl p-8 text-center max-w-2xl mx-auto my-12 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#5fb39f]/10 border border-[#5fb39f]/20 flex items-center justify-center text-2xl text-[#5fb39f]">
              💬
            </div>
            <h2 className="text-2xl font-bold text-white">CodeHub Chat Room</h2>
            <p className="text-sm text-[#9a9ca3] leading-relaxed">
              Connect in real-time with fellow coders, discuss problems, share optimal algorithms, and pair program.
            </p>
            <div className="pt-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-[#5fb39f] bg-[#5fb39f]/10 border border-[#5fb39f]/30">
                Live Discussion Space
              </span>
            </div>
          </div>
        )}
      </main>

      {/* 7. Settings Modal Component */}
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
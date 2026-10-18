import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import CodeHubLogo from "./CodeHubLogo";
import { logoutUser, fetchUserProfile } from "../store/slices/authSlice";

export default function Navbar({ activeSection = "problems", onSectionChange, onOpenSettings }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, profile } = useSelector((state) => state.auth);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch full profile info (including solved problem count) if not already loaded
  useEffect(() => {
    if (!profile) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, profile]);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await dispatch(logoutUser());
    navigate("/login");
  };

  // Derive user display information
  const username = profile?.username || user?.username || "Coder";
  const displayName = profile?.name || username;
  const email = profile?.email || user?.email || "";
  const avatarUrl =
    profile?.avatar ||
    user?.avatar ||
    user?.profile?.avatar ||
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

  // Problem solved count statistics
  const totalSolved =
    profile?.solvedStats?.totalSolved ??
    (user?.problemsSolved ? user.problemsSolved.length : 0);
  const breakdown = profile?.solvedStats?.breakdown || { easy: 0, medium: 0, hard: 0 };

  const navItems = [
    { id: "problems", label: "Problems" },
    { id: "contest", label: "Contest" },
    { id: "chat", label: "Chat Room" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#1a1b1f] border-b border-[#2a2c31] px-4 sm:px-6">
      <div className="max-w-7xl mx-auto h-13 flex items-center justify-between">
        {/* Left: Brand + Navigation Links */}
        <div className="flex items-center gap-8">
          <CodeHubLogo size="sm" />

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange && onSectionChange(item.id)}
                  className={`relative px-3.5 py-4 text-sm font-medium transition-colors cursor-pointer select-none ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-[#a3a5ab] hover:text-white"
                  }`}
                >
                  {item.label}
                  {/* LeetCode style bottom active bar */}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e2a24a] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: User Profile & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-label="User menu"
            aria-expanded={isDropdownOpen}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-[#222428] transition-all cursor-pointer group focus:outline-none"
          >
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#2e3035] group-hover:border-[#e2a24a] transition-colors flex items-center justify-center bg-[#151619]">
              {!imgError && avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={username}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-[#e2a24a]">
                  {username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Subtle chevron */}
            <svg
              className={`w-3.5 h-3.5 text-[#9a9ca3] transition-transform duration-200 group-hover:text-white ${
                isDropdownOpen ? "rotate-180 text-white" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-72 rounded-xl bg-[#1a1b1f] border border-[#2c2e33] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              style={{
                boxShadow: "0 12px 30px -4px rgba(0, 0, 0, 0.7), 0 4px 10px rgba(0, 0, 0, 0.5)",
              }}
            >
              {/* Header: User identity */}
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-[#2e3035] flex-shrink-0 bg-[#151619] flex items-center justify-center">
                  {!imgError && avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-base font-bold text-[#e2a24a]">
                      {username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="overflow-hidden">
                  <div className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                    <span className="truncate">{displayName}</span>
                    {profile?.isVerified && (
                      <span className="text-[#5fb39f] text-xs" title="Verified Account">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#9a9ca3] truncate">@{username}</div>
                  {email && (
                    <div className="text-[11px] text-[#767980] truncate mt-0.5">{email}</div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="h-[1px] bg-[#2a2c31] my-1" />

              {/* Problem Solved Count Section */}
              <div className="px-4 py-3 bg-[#16171a]/60 mx-2 my-1 rounded-lg border border-[#202226]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#a3a5ab] flex items-center gap-1.5">
                    {/* LeetCode check badge icon */}
                    <svg className="w-4 h-4 text-[#e2a24a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Problems Solved
                  </span>
                  <span className="text-base font-bold text-[#e2a24a] tabular-nums">
                    {totalSolved}
                  </span>
                </div>

                {/* Difficulty breakdown pills */}
                <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
                  <div className="px-1.5 py-1 rounded bg-[#5fb39f]/10 border border-[#5fb39f]/20">
                    <div className="text-[10px] text-[#5fb39f] font-medium">Easy</div>
                    <div className="text-xs font-bold text-white">{breakdown.easy ?? 0}</div>
                  </div>
                  <div className="px-1.5 py-1 rounded bg-[#d6b45f]/10 border border-[#d6b45f]/20">
                    <div className="text-[10px] text-[#d6b45f] font-medium">Med</div>
                    <div className="text-xs font-bold text-white">{breakdown.medium ?? 0}</div>
                  </div>
                  <div className="px-1.5 py-1 rounded bg-[#d47470]/10 border border-[#d47470]/20">
                    <div className="text-[10px] text-[#d47470] font-medium">Hard</div>
                    <div className="text-xs font-bold text-white">{breakdown.hard ?? 0}</div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-[1px] bg-[#2a2c31] my-1" />

              {/* Dropdown Options */}
              <div className="px-2 py-1 space-y-0.5">
                {/* My Profile option */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate(`/u/${username}`);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#cdced2] hover:text-white hover:bg-[#222428] transition-colors cursor-pointer group text-left"
                >
                  <svg
                    className="w-4 h-4 text-[#9a9ca3] group-hover:text-white transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>My Profile</span>
                </button>

                {/* Settings option */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    if (onOpenSettings) onOpenSettings();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#cdced2] hover:text-white hover:bg-[#222428] transition-colors cursor-pointer group text-left"
                >
                  <svg
                    className="w-4 h-4 text-[#9a9ca3] group-hover:text-white transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>Settings</span>
                </button>

                {/* Sign Out option */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#cdced2] hover:text-[#d47470] hover:bg-[#d47470]/10 transition-colors cursor-pointer group text-left"
                >
                  <svg
                    className="w-4 h-4 text-[#9a9ca3] group-hover:text-[#d47470] transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

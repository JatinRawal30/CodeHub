import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import CodeHubLogo from "./CodeHubLogo";
import UserAvatar from "./UserAvatar";
import VerifiedBadge from "./VerifiedBadge";
import ThemeToggle from "./ThemeToggle";
import UserSearch from "./UserSearch";
import { logoutUser, fetchUserProfile } from "../store/slices/authSlice";

// `wide` lines the bar up with pages that use the wider 7xl column (profile)
export default function Navbar({ activeSection = "problems", onSectionChange, onOpenSettings, wide = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, profile } = useSelector((state) => state.auth);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // solved counts live on the full profile
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

  const username = profile?.username || user?.username || "Coder";
  const displayName = profile?.name || username;
  const email = profile?.email || user?.email || "";
  // comes with login/refresh and is updated by setAvatar after an upload
  const avatar = user?.avatar || profile?.avatar || null;

  const totalSolved =
    profile?.solvedStats?.totalSolved ??
    (user?.problemsSolved ? user.problemsSolved.length : 0);
  const breakdown = profile?.solvedStats?.breakdown || { easy: 0, medium: 0, hard: 0 };

  const navItems = [
    { id: "problems", label: "Problems" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "contest", label: "Contest" },
  ];

  const menuItemClass =
    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-body-md text-fg-body hover:text-fg hover:bg-surface-hover transition-colors cursor-pointer group text-left";
  const menuIconClass = "w-4 h-4 text-fg-muted group-hover:text-fg transition-colors";

  return (
    <nav className="sticky top-0 z-50 w-full bg-canvas/70 backdrop-blur-xl">
      <div className={`mx-auto flex h-16 items-center justify-between px-4 sm:px-6 ${wide ? "max-w-7xl" : "max-w-6xl"}`}>
        <div className="flex items-center gap-3 sm:gap-6 lg:gap-10 min-w-0">
          <CodeHubLogo size="sm" />

          {/* scrolls sideways on phones so the controls on the right stay on screen */}
          <div className="flex items-center gap-1 min-w-0 py-1 overflow-x-auto [scrollbar-width:none] [mask-image:linear-gradient(to_right,black_80%,transparent)] md:[mask-image:none]">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange && onSectionChange(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative shrink-0 whitespace-nowrap rounded-full px-3 lg:px-4 py-2 text-[0.95rem] transition-colors cursor-pointer select-none ${
                    isActive ? "text-fg" : "text-fg-muted hover:text-fg"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <UserSearch />
          <ThemeToggle />

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-label="User menu"
              aria-expanded={isDropdownOpen}
              className="flex items-center gap-1.5 rounded-full p-0.5 text-fg-muted transition-colors hover:text-fg cursor-pointer"
            >
              <UserAvatar src={avatar} name={username} size={36} className="rounded-full" />

              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180 text-fg" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* dropdown */}
            {isDropdownOpen && (
              <div className="popover absolute right-0 mt-2 w-72 py-1.5 z-50">
                <div className="px-3.5 py-3 flex items-center gap-3">
                  <UserAvatar src={avatar} name={username} size={40} className="rounded-full border border-line" />
                  <div className="overflow-hidden">
                    <div className="text-body-md font-semibold text-fg truncate flex items-center gap-1.5">
                      <span className="truncate">{displayName}</span>
                      {profile?.isVerified && (
                        <VerifiedBadge size={14} title="Verified account" />
                      )}
                    </div>
                    <div className="text-body-sm text-fg-muted truncate">@{username}</div>
                    {email && (
                      <div className="text-xs text-fg-subtle truncate mt-0.5">{email}</div>
                    )}
                  </div>
                </div>

                <div className="divider my-1" />

                <div className="px-3 py-2.5 bg-surface-alt mx-2 my-1.5 rounded-md border border-line">
                  <div className="flex items-center justify-between mb-2">
                    <span className="label-caps text-fg-muted flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Problems Solved
                    </span>
                    <span className="text-code-md font-semibold text-fg">
                      {totalSolved}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
                    <div className="px-1.5 py-1 rounded-lg bg-success-soft border border-success-line">
                      <div className="text-[10px] text-success-fg font-medium">Easy</div>
                      <div className="text-code-sm text-fg">{breakdown.easy ?? 0}</div>
                    </div>
                    <div className="px-1.5 py-1 rounded-lg bg-warning-soft border border-warning-line">
                      <div className="text-[10px] text-warning-fg font-medium">Med</div>
                      <div className="text-code-sm text-fg">{breakdown.medium ?? 0}</div>
                    </div>
                    <div className="px-1.5 py-1 rounded-lg bg-danger-soft border border-danger-line">
                      <div className="text-[10px] text-danger-fg font-medium">Hard</div>
                      <div className="text-code-sm text-fg">{breakdown.hard ?? 0}</div>
                    </div>
                  </div>
                </div>

                <div className="divider my-1" />

                <div className="px-1.5 py-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate(`/u/${username}`);
                    }}
                    className={menuItemClass}
                  >
                    <svg className={menuIconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>My Profile</span>
                  </button>

                  {user?.role === "admin" && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/admin");
                      }}
                      className={menuItemClass}
                    >
                      <svg className={menuIconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.5 12l2 2 3.5-4" />
                      </svg>
                      <span>Admin</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      if (onOpenSettings) onOpenSettings();
                    }}
                    className={menuItemClass}
                  >
                    <svg className={menuIconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-body-md text-fg-body hover:text-danger-fg hover:bg-danger-soft transition-colors cursor-pointer group text-left"
                  >
                    <svg
                      className="w-4 h-4 text-fg-muted group-hover:text-danger-fg transition-colors"
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
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-line to-transparent" />
    </nav>
  );
}

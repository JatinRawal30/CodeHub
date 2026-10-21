import UserAvatar from "./UserAvatar";

export default function SettingsModal({
  isOpen = false,
  onClose,
  user,
  profile,
  totalSolvedCount = 0,
}) {
  if (!isOpen) return null;

  const username = profile?.username || user?.username || "Coder";
  const displayName = profile?.name || username;
  const email = profile?.email || user?.email || "—";
  const role = profile?.role || user?.role || "user";
  const bio = profile?.bio || "No bio yet";
  const avatar = user?.avatar || profile?.avatar || null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1a1b1f] border border-[#2e3035] rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2a2c31]">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-[#e2a24a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Account Settings
          </h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-[#9a9ca3] hover:text-white p-1 rounded-lg hover:bg-[#2a2c31] transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Profile Info Summary */}
        <div className="py-5 space-y-4 text-sm">
          <div className="flex items-center gap-4 bg-[#151619] p-3 rounded-xl border border-[#202226]">
            <UserAvatar src={avatar} name={username} size={48} className="rounded-full border border-[#2e3035]" />
            <div className="overflow-hidden">
              <div className="font-semibold text-white truncate">{displayName}</div>
              <div className="text-xs text-[#9a9ca3] truncate">@{username}</div>
              <div className="text-xs text-[#e2a24a] capitalize mt-0.5 font-medium">
                Role: {role}
              </div>
            </div>
          </div>

          {/* Account Details Table */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-2 border-b border-[#202226]">
              <span className="text-[#9a9ca3]">Email</span>
              <span className="text-white tabular-nums">{email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#202226]">
              <span className="text-[#9a9ca3]">Problems Solved</span>
              <span className="text-[#e2a24a] font-bold tabular-nums">{totalSolvedCount}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#202226]">
              <span className="text-[#9a9ca3]">Bio</span>
              <span className="text-white truncate max-w-[200px]">{bio}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#2a2c31] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#e2a24a] hover:bg-[#d39540] text-black font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

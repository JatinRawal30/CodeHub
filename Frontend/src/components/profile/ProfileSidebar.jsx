import { useState } from "react";
import { getLanguageLabel } from "../../constants/languages";

function Avatar({ src, name }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="w-20 h-20 rounded-xl bg-[#151619] border border-[#2e3035] flex items-center justify-center text-2xl font-bold text-[#e2a24a]">
        {name?.charAt(0).toUpperCase() || "?"}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setFailed(true)}
      className="w-20 h-20 rounded-xl object-cover border border-[#2e3035]"
    />
  );
}

function SectionTitle({ children }) {
  return <h3 className="text-sm font-semibold text-white mb-3">{children}</h3>;
}

export default function ProfileSidebar({ profile, isOwner, ownerEmail, onEdit }) {
  const languageEntries = Object.entries(profile.languageStats || {}).sort((a, b) => b[1] - a[1]);
  const joined = new Date(profile.memberSince).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <aside className="bg-[#1a1b1f] border border-[#2a2c31] rounded-xl p-5 space-y-5">
      {/* Identity */}
      <div className="flex gap-4">
        <Avatar src={profile.avatar} name={profile.name || profile.username} />
        <div className="min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-semibold text-white truncate">{profile.name}</h1>
            {profile.isVerified && (
              <span className="text-[#68b582] text-xs" title="Verified email">✓</span>
            )}
          </div>
          <div className="text-sm text-[#9a9ca3] truncate">@{profile.username}</div>
          <div className="mt-2 text-sm text-[#9a9ca3]">
            Rank <span className="font-semibold text-white tabular-nums">{profile.rank?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {isOwner && (
        <button
          onClick={onEdit}
          className="w-full py-2 rounded-lg text-sm font-medium bg-[#68b582]/15 text-[#68b582] hover:bg-[#68b582]/25 transition-colors cursor-pointer"
        >
          Edit Profile
        </button>
      )}

      {profile.bio && <p className="text-sm text-[#c4c6cb] leading-relaxed whitespace-pre-wrap">{profile.bio}</p>}

      {/* Meta */}
      <ul className="space-y-2 text-sm text-[#9a9ca3]">
        <li className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Joined {joined}
        </li>
        {isOwner && ownerEmail && (
          <li className="flex items-center gap-2 min-w-0">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{ownerEmail}</span>
            {!profile.isVerified && (
              <span className="shrink-0 text-[11px] text-[#e2a24a] bg-[#e2a24a]/10 px-1.5 py-0.5 rounded">unverified</span>
            )}
          </li>
        )}
      </ul>

      {profile.languagePreferences?.length > 0 && (
        <div>
          <SectionTitle>Preferred Languages</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {profile.languagePreferences.map((lang) => (
              <span key={lang} className="px-2.5 py-1 rounded-full text-xs bg-[#2c2e33] text-[#c4c6cb]">
                {getLanguageLabel(lang)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="h-px bg-[#2a2c31]" />

      {/* Languages used for accepted solutions */}
      <div>
        <SectionTitle>Languages</SectionTitle>
        {languageEntries.length === 0 ? (
          <p className="text-xs text-[#767980]">No accepted solutions yet.</p>
        ) : (
          <ul className="space-y-2.5">
            {languageEntries.map(([lang, count]) => (
              <li key={lang} className="flex items-center justify-between text-sm">
                <span className="px-2.5 py-0.5 rounded-full text-xs bg-[#2c2e33] text-[#c4c6cb]">
                  {getLanguageLabel(lang)}
                </span>
                <span className="text-[#9a9ca3]">
                  <span className="font-semibold text-white tabular-nums">{count}</span> problem{count === 1 ? "" : "s"} solved
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="h-px bg-[#2a2c31]" />

      {/* Skills from solved problem tags */}
      <div>
        <SectionTitle>Skills</SectionTitle>
        {profile.tagStats?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {profile.tagStats.slice(0, 12).map(({ tag, count }) => (
              <span key={tag} className="px-2.5 py-1 rounded-full text-xs bg-[#2c2e33] text-[#c4c6cb] capitalize">
                {tag} <span className="text-[#9a9ca3]">×{count}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#767980]">Solve problems to build your skill tags.</p>
        )}
      </div>
    </aside>
  );
}

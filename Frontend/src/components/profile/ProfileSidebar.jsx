import { getLanguageLabel } from "../../constants/languages";
import UserAvatar from "../UserAvatar";
import VerifiedBadge from "../VerifiedBadge";

function SectionTitle({ children }) {
  return <h3 className="label-caps text-fg-muted mb-3">{children}</h3>;
}

export default function ProfileSidebar({ profile, isOwner, ownerEmail, onEdit }) {
  const languageEntries = Object.entries(profile.languageStats || {}).sort((a, b) => b[1] - a[1]);
  const joined = new Date(profile.memberSince).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <aside className="card p-5 space-y-5">
      <div className="flex gap-4">
        <UserAvatar src={profile.avatar} name={profile.username} size={80} className="rounded-full border border-line" />
        <div className="min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <h1 className="text-headline-sm text-fg truncate">{profile.name}</h1>
            {profile.isVerified && (
              <VerifiedBadge size={18} title="Verified email" />
            )}
          </div>
          <div className="text-code-md text-fg-muted truncate">@{profile.username}</div>
          <div className="mt-2 text-body-sm text-fg-muted">
            Rank <span className="text-code-md font-semibold text-fg">{profile.rank?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {isOwner && (
        <button
          onClick={onEdit}
          className="btn btn-secondary w-full"
        >
          Edit Profile
        </button>
      )}

      {profile.bio && <p className="text-body-md text-fg-body whitespace-pre-wrap">{profile.bio}</p>}

      <ul className="space-y-2 text-body-sm text-fg-muted">
        <li className="flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0 text-fg-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Joined {joined}
        </li>
        {isOwner && ownerEmail && (
          <li className="flex items-center gap-2 min-w-0">
            <svg className="w-4 h-4 shrink-0 text-fg-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{ownerEmail}</span>
            {!profile.isVerified && (
              <span className="shrink-0 badge badge-warning">unverified</span>
            )}
          </li>
        )}
      </ul>

      {profile.languagePreferences?.length > 0 && (
        <div>
          <SectionTitle>Preferred Languages</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {profile.languagePreferences.map((lang) => (
              <span key={lang} className="badge badge-neutral">
                {getLanguageLabel(lang)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="divider" />

      {/* languages used in accepted solutions */}
      <div>
        <SectionTitle>Languages</SectionTitle>
        {languageEntries.length === 0 ? (
          <p className="text-body-sm text-fg-subtle">No accepted solutions yet.</p>
        ) : (
          <ul className="space-y-2.5">
            {languageEntries.map(([lang, count]) => (
              <li key={lang} className="flex items-center justify-between text-body-sm">
                <span className="badge badge-neutral">
                  {getLanguageLabel(lang)}
                </span>
                <span className="text-fg-muted">
                  <span className="text-code-md font-semibold text-fg">{count}</span> problem{count === 1 ? "" : "s"} solved
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="divider" />

      {/* skills = tags of solved problems */}
      <div>
        <SectionTitle>Skills</SectionTitle>
        {profile.tagStats?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {profile.tagStats.slice(0, 12).map(({ tag, count }) => (
              <span key={tag} className="badge badge-info capitalize">
                {tag} <span className="opacity-70">×{count}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-body-sm text-fg-subtle">Solve problems to build your skill tags.</p>
        )}
      </div>
    </aside>
  );
}

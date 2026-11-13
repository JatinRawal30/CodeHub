import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import Navbar from "../Navbar";
import SettingsModal from "../SettingsModal";

// Page frame shared by the admin pages: the site header and one centered column
export default function AdminShell({ children }) {
  const navigate = useNavigate();
  const { user, profile } = useSelector((state) => state.auth);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-fg-body">
      <Navbar
        activeSection={null}
        onSectionChange={(section) => navigate("/", { state: { section } })}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">{children}</main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        profile={profile}
        totalSolvedCount={profile?.solvedStats?.totalSolved ?? 0}
      />
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import SolvedProgressCard from "../components/profile/SolvedProgressCard";
import SubmissionStatsCard from "../components/profile/SubmissionStatsCard";
import SubmissionHeatmap from "../components/profile/SubmissionHeatmap";
import RecentAcList from "../components/profile/RecentAcList";
import EditProfileModal from "../components/profile/EditProfileModal";
import { fetchPublicProfile } from "../api/profile";
import { getApiErrorMessage } from "../api/execution";
import { fetchUserProfile } from "../store/slices/authSlice";

function ProfileSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] items-start animate-pulse">
      <div className="h-[520px] rounded-xl bg-[#1a1b1f] border border-[#2a2c31]" />
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-52 rounded-xl bg-[#1a1b1f] border border-[#2a2c31]" />
          <div className="h-52 rounded-xl bg-[#1a1b1f] border border-[#2a2c31]" />
        </div>
        <div className="h-44 rounded-xl bg-[#1a1b1f] border border-[#2a2c31]" />
        <div className="h-64 rounded-xl bg-[#1a1b1f] border border-[#2a2c31]" />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, profile: myProfile } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const isOwner = Boolean(user?.username && user.username === username);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const data = await fetchPublicProfile(username);
        if (isMounted) setProfile(data);
      } catch (err) {
        if (isMounted) {
          setError(err.response?.status === 404 ? `User "${username}" doesn't exist.` : getApiErrorMessage(err, "Failed to load profile."));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [username, refreshKey]);

  // After saving: reload this page's data and the navbar's private profile
  const handleProfileSaved = useCallback(() => {
    setRefreshKey((k) => k + 1);
    dispatch(fetchUserProfile());
  }, [dispatch]);

  const closeEdit = useCallback(() => setIsEditOpen(false), []);

  return (
    <div className="min-h-screen bg-[#121315] text-[#e6e7ea] flex flex-col font-leetcode antialiased">
      <Navbar
        activeSection={null}
        onSectionChange={(section) => navigate("/", { state: { section } })}
        onOpenSettings={() => setIsEditOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {isLoading && !profile ? (
          <ProfileSkeleton />
        ) : error ? (
          <div className="bg-[#1a1b1f] border border-[#2a2c31] rounded-xl p-10 text-center space-y-3 max-w-lg mx-auto mt-12">
            <p className="text-white font-medium">{error}</p>
            <Link to="/" className="text-sm text-[#e2a24a] hover:underline">
              Back to problems
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] items-start">
            <ProfileSidebar
              profile={profile}
              isOwner={isOwner}
              ownerEmail={isOwner ? myProfile?.email : null}
              onEdit={() => setIsEditOpen(true)}
            />

            <div className="space-y-4 min-w-0">
              <div className="grid gap-4 md:grid-cols-2">
                <SolvedProgressCard solvedStats={profile.solvedStats} />
                <SubmissionStatsCard submissionStats={profile.submissionStats} />
              </div>
              <SubmissionHeatmap calendar={profile.submissionCalendar} />
              <RecentAcList items={profile.recentAccepted} />
            </div>
          </div>
        )}
      </main>

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={closeEdit}
        profile={myProfile}
        onSaved={handleProfileSaved}
      />
    </div>
  );
}

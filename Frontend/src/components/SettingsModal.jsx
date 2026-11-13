import { useState } from "react";
import { useDispatch } from "react-redux";
import UserAvatar from "./UserAvatar";
import ConfirmDialog from "./admin/ConfirmDialog";
import { deleteMyAccount } from "../api/profile";
import { getApiErrorMessage } from "../api/execution";
import { clearAuth } from "../store/slices/authSlice";

export default function SettingsModal({
  isOpen = false,
  onClose,
  user,
  profile,
  totalSolvedCount = 0,
}) {
  const dispatch = useDispatch();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (!isOpen) return null;

  const username = profile?.username || user?.username || "Coder";
  const displayName = profile?.name || username;
  const email = profile?.email || user?.email || "—";
  const role = profile?.role || user?.role || "user";
  const bio = profile?.bio || "No bio yet";
  const avatar = user?.avatar || profile?.avatar || null;

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteMyAccount();
      dispatch(clearAuth()); // signed out: the route guard in App sends the user to /login
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, "Couldn't delete your account. Try again."));
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-backdrop backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card shadow-overlay max-w-md w-full p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <h3 className="text-headline-sm text-fg flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className="btn btn-ghost btn-sm btn-icon w-8"
          >
            ✕
          </button>
        </div>

        <div className="py-5 space-y-4 text-sm">
          <div className="flex items-center gap-4 bg-surface-alt p-3 rounded-lg border border-line">
            <UserAvatar src={avatar} name={username} size={48} className="rounded-full border border-line" />
            <div className="overflow-hidden">
              <div className="font-semibold text-fg truncate">{displayName}</div>
              <div className="text-body-sm text-fg-muted truncate">@{username}</div>
              <div className="text-xs text-primary-soft-fg capitalize mt-0.5 font-medium">
                Role: {role}
              </div>
            </div>
          </div>

          <div className="space-y-1 text-body-sm">
            <div className="flex justify-between py-2 border-b border-line-subtle">
              <span className="text-fg-muted">Email</span>
              <span className="text-fg">{email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-line-subtle">
              <span className="text-fg-muted">Problems Solved</span>
              <span className="text-code-md text-fg">{totalSolvedCount}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-line-subtle">
              <span className="text-fg-muted">Bio</span>
              <span className="text-fg truncate max-w-[200px]">{bio}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="text-body-sm">
              <div className="font-medium text-fg">Delete account</div>
              <div className="text-fg-muted">Removes your profile and all your submissions for good.</div>
            </div>
            <button type="button" onClick={() => setIsConfirmingDelete(true)} className="btn btn-danger-soft btn-sm shrink-0">
              Delete account
            </button>
          </div>
          {deleteError && (
            <p className="alert alert-error" role="alert">
              {deleteError}
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-line flex justify-end">
          <button
            onClick={onClose}
            className="btn btn-primary btn-sm"
          >
            Close
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={isConfirmingDelete}
        title="Delete your account?"
        body={`This permanently deletes @${username}, your profile and all your submissions. It can't be undone.${
          role === "admin" ? " If this is the only admin account, no one will be able to manage problems afterwards." : ""
        }`}
        confirmLabel="Delete my account"
        isBusy={isDeleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setIsConfirmingDelete(false)}
      />
    </div>
  );
}

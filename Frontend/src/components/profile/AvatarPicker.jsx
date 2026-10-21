import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import UserAvatar from "../UserAvatar";
import { removeAvatar, uploadAvatar } from "../../api/profile";
import { getApiErrorMessage } from "../../api/execution";
import { setAvatar } from "../../store/slices/authSlice";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // checked before resizing; the upload itself is much smaller

// Photo picker for the Edit Profile popup. Uploads immediately when a photo is chosen.
export default function AvatarPicker({ avatar, name, onChanged }) {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null); // local preview of the chosen file while it uploads
  const [stage, setStage] = useState("");       // "Preparing photo…" / "Uploading…" / "Saving…" / "Removing…"
  const [error, setError] = useState("");
  const isBusy = Boolean(stage);

  // Free the preview's memory when it's replaced or the popup closes
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChosen = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // so choosing the same file again still triggers a change
    if (!file) return;

    setError("");
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That image is larger than 5 MB.");
      return;
    }

    setPreview(URL.createObjectURL(file));
    try {
      const url = await uploadAvatar(file, { onStage: setStage });
      dispatch(setAvatar(url)); // Navbar, Settings and profile update instantly
      onChanged?.();
    } catch (err) {
      setError(getApiErrorMessage(err, err.message || "Upload failed. Please try again."));
    } finally {
      setStage("");
      setPreview(null);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm("Remove your profile photo?")) return;
    setError("");
    setStage("Removing…");
    try {
      await removeAvatar();
      dispatch(setAvatar(null));
      onChanged?.();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not remove the photo."));
    } finally {
      setStage("");
    }
  };

  return (
    <div className="flex items-center gap-4 pb-4 mb-4 border-b border-[#2a2c31]">
      <div className="relative">
        {preview ? (
          <img src={preview} alt="" className="w-[72px] h-[72px] rounded-xl object-cover border border-[#2e3035] opacity-60" />
        ) : (
          <UserAvatar src={avatar} name={name} size={72} className="rounded-xl border border-[#2e3035]" />
        )}
        {isBusy && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-[#e2a24a] border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isBusy}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#2c2e33] text-[#e6e7ea] hover:bg-[#33363c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {avatar ? "Change photo" : "Upload photo"}
          </button>
          {avatar && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isBusy}
              className="px-3 py-1.5 rounded-lg text-xs text-[#9a9ca3] hover:text-[#d47470] hover:bg-[#d47470]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Remove
            </button>
          )}
        </div>
        <p className={`text-[11px] ${error ? "text-[#d47470]" : "text-[#767980]"}`}>
          {error || stage || "JPG, PNG or WebP, up to 5 MB."}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFileChosen}
        className="hidden"
      />
    </div>
  );
}

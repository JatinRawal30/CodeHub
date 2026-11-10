import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import UserAvatar from "../UserAvatar";
import { removeAvatar, uploadAvatar } from "../../api/profile";
import { getApiErrorMessage } from "../../api/execution";
import { setAvatar } from "../../store/slices/authSlice";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // checked before resizing; the upload itself is much smaller

// Uploads as soon as a photo is picked
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
    <div className="flex items-center gap-4 pb-4 mb-4 border-b border-line">
      <div className="relative">
        {preview ? (
          <img src={preview} alt="" className="w-[72px] h-[72px] rounded-lg object-cover border border-line opacity-60" />
        ) : (
          <UserAvatar src={avatar} name={name} size={72} className="rounded-full border border-line" />
        )}
        {isBusy && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="spinner w-6 h-6 text-primary" />
          </div>
        )}
      </div>

      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isBusy}
            className="btn btn-secondary btn-sm"
          >
            {avatar ? "Change photo" : "Upload photo"}
          </button>
          {avatar && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isBusy}
              className="btn btn-danger-soft btn-sm"
            >
              Remove
            </button>
          )}
        </div>
        <p className={`text-body-sm ${error ? "text-danger-fg" : "text-fg-muted"}`}>
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

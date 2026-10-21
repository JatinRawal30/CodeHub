import api from "./axios";
import { resizeImage } from "../utils/resizeImage";

export async function fetchPublicProfile(username) {
  const res = await api.get(`/user/${encodeURIComponent(username)}`);
  return res.data.profile;
}

// { firstName?, lastName?, bio?, languagePreferences? } — "" clears lastName.
// The avatar is not part of this: use uploadAvatar / removeAvatar.
export async function updateMyProfile(updates) {
  const res = await api.put("/user/profile", updates);
  return res.data.profile;
}

// Returns a fresh access token; other devices are signed out
export async function changeMyPassword({ oldPassword, newPassword, confirmPassword }) {
  const res = await api.patch("/user/profile/change-password", { oldPassword, newPassword, confirmPassword });
  return res.data;
}

// Parameters the backend signed; they must be sent to Cloudinary exactly as received
const SIGNED_UPLOAD_FIELDS = ["public_id", "overwrite", "invalidate", "allowed_formats", "transformation", "timestamp"];

/**
 * Upload a new profile photo. Returns the saved avatar URL.
 *   1. shrink the photo in the browser
 *   2. ask our backend for a signed "permission slip"
 *   3. upload the file straight to Cloudinary (never through our server)
 *   4. send Cloudinary's signed receipt to our backend, which verifies and saves it
 */
export async function uploadAvatar(file, { onStage } = {}) {
  onStage?.("Preparing photo…");
  const image = await resizeImage(file);

  onStage?.("Uploading…");
  const { data: sig } = await api.post("/user/avatar/signature");

  const form = new FormData();
  form.append("file", image);
  form.append("api_key", sig.apiKey);
  form.append("signature", sig.signature);
  for (const field of SIGNED_UPLOAD_FIELDS) {
    form.append(field, sig[field]);
  }

  // Plain fetch (not our `api` instance) so the CodeHub login token is never sent to a third party
  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  const uploaded = await uploadRes.json();
  if (!uploadRes.ok) {
    throw new Error(uploaded.error?.message || "Upload failed. Please try again.");
  }

  onStage?.("Saving…");
  const { data } = await api.put("/user/avatar", {
    public_id: uploaded.public_id,
    version: uploaded.version,
    signature: uploaded.signature,
  });
  return data.avatar;
}

// Deletes the photo from Cloudinary and the profile; the UI falls back to initials
export async function removeAvatar() {
  await api.delete("/user/avatar");
}

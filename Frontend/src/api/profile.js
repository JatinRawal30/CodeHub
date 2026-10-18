import api from "./axios";

export async function fetchPublicProfile(username) {
  const res = await api.get(`/user/${encodeURIComponent(username)}`);
  return res.data.profile;
}

// { firstName?, lastName?, bio?, avatar?, languagePreferences? } — "" clears lastName / avatar
export async function updateMyProfile(updates) {
  const res = await api.put("/user/profile", updates);
  return res.data.profile;
}

// Returns a fresh access token; other devices are signed out
export async function changeMyPassword({ oldPassword, newPassword, confirmPassword }) {
  const res = await api.patch("/user/profile/change-password", { oldPassword, newPassword, confirmPassword });
  return res.data;
}

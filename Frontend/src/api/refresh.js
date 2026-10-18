import axios from "axios";

export const API_BASE_URL = "http://localhost:3200/api";

// The backend rotates the refresh token on every /auth/refresh call, so two
// parallel refreshes with the same cookie make the second one fail (and log
// the user out). All callers share this single in-flight request instead.
let refreshPromise = null;

export function refreshSession() {
  if (!refreshPromise) {
    // Plain axios (not `api`) so a failed refresh doesn't re-enter the 401 interceptor
    refreshPromise = axios
      .post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
      .then((res) => res.data) // { accessToken, user }
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

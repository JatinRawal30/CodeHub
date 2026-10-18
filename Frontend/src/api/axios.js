import axios from "axios";
import { store } from "../store/store";
import { setAccessToken, clearAuth } from "../store/slices/authSlice";
import { API_BASE_URL, refreshSession } from "./refresh";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // sends refreshToken cookie automatically
});

// Attach accessToken from Redux to every request
api.interceptors.request.use((config) => { 
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {     //._retry tells have you retried or not?
      original._retry = true;  //mark as retried. If the refresh token is also invalid or expired, the retry will fail with 401 again. Without _retry = true, your browser would get trapped in an infinite loop
      try {
        // Shared with any other request that 401'd at the same time (see refresh.js)
        const { accessToken: newToken } = await refreshSession();
        store.dispatch(setAccessToken(newToken));
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original); // retry original request
      } catch (err) {
        store.dispatch(clearAuth());
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

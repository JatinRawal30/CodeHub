import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { refreshSession } from "../../api/refresh";

// ─── Async Thunk: checkAuth ──────────────────────────────────────────────────
// Automatically runs on app startup / page refresh (F5):
// Sends HTTP-only refreshToken cookie to /api/auth/refresh and gets { accessToken, user }
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const data = await refreshSession();

      return {
        accessToken: data.accessToken,
        user: data.user,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error || "Session expired"
      );
    }
  }
);

// ─── Async Thunk: fetchUserProfile ──────────────────────────────────────────
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/user/profile");
      return res.data?.profile;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error || "Failed to load profile"
      );
    }
  }
);

// ─── Async Thunk: logoutUser ────────────────────────────────────────────────
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      dispatch(clearAuth());
    }
  }
);

// ─── Initial State ───────────────────────────────────────────────────────────
const initialState = {
  user: null,             // { id, username, email, role, avatar } from login / refresh
  profile: null,          // { username, name, avatar, bio, solvedStats, ... }
  accessToken: null,      // In-memory token (no localStorage)
  isAuthenticated: false,
  isLoading: true,        // True on initial load until checkAuth resolves
  error: null,
};

// ─── Slice ───────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload || {};
      state.user = user ?? null;
      state.accessToken = accessToken ?? null;
      state.isAuthenticated = Boolean(accessToken);
      state.isLoading = false;
      state.error = null;
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      state.isAuthenticated = Boolean(action.payload);
    },
    setUserProfile: (state, action) => {
      state.profile = action.payload;
    },
    // After uploading or removing a photo: payload is the new URL, or null
    setAvatar: (state, action) => {
      const url = action.payload || null;
      if (state.user) state.user.avatar = url;
      if (state.profile) state.profile.avatar = url;
    },
    clearAuth: (state) => {
      state.user = null;
      state.profile = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkAuth: Pending (checking refresh cookie)
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // checkAuth: Fulfilled (valid session restored!)
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      // checkAuth: Rejected (no cookie or session expired)
      .addCase(checkAuth.rejected, (state, action) => {
        state.user = null;
        state.profile = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = action.payload;
      })
      // fetchUserProfile: Fulfilled
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      });
  },
});

export const { setCredentials, setAccessToken, setUserProfile, setAvatar, clearAuth, setLoading } = authSlice.actions;
export default authSlice.reducer;

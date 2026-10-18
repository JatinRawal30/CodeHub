import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import api from "../api/axios";
import { setCredentials } from "../store/slices/authSlice";
import CodeHubLogo from "../components/CodeHubLogo";

// ─── Zod Login Schema ───────────────────────────────────────────────────────
const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Email or Username is required"),
  password: z
    .string()
    .min(1, "Password is required"),
});

// ─── Login Page (LeetCode Dark Theme) ────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Success message if redirected from successful signup
  const registeredSuccess = location.state?.registered;

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    setApiError("");
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", {
        identifier: data.identifier,
        password: data.password,
      });

      // Save credentials in Redux store (in-memory token, no localStorage)
      if (res.data?.accessToken) {
        dispatch(
          setCredentials({
            user: res.data.user,
            accessToken: res.data.accessToken,
          })
        );
      }

      // Navigate to homepage / dashboard
      navigate("/");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid username/email or password.";
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 selection:bg-[#e2a24a] selection:text-black"
      style={{ backgroundColor: "#121315" }}
    >
      <div className="w-full max-w-[440px]">
        {/* CodeHub Logo */}
        <div className="text-center mb-7">
          <CodeHubLogo />
          <p className="mt-2 text-xs text-[#9a9ca3] tracking-wide">
            A New Way to Learn & Master Algorithms
          </p>
        </div>

        {/* LeetCode Elevated Card */}
        <div
          className="rounded-xl p-8 transition-all"
          style={{
            backgroundColor: "#1a1b1f",
            border: "1px solid #2a2c31",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
          }}
        >
          <h1 className="text-lg font-bold text-white mb-5 tracking-tight">
            Sign In
          </h1>

          {/* Success banner after registration */}
          {registeredSuccess && !apiError && (
            <div
              className="mb-4 px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2"
              style={{
                backgroundColor: "rgba(95, 179, 159, 0.15)",
                border: "1px solid rgba(95, 179, 159, 0.3)",
                color: "#7cc4b2",
              }}
            >
              <span>✓</span>
              <span>Account created successfully! Please sign in.</span>
            </div>
          )}

          {/* API Error Message */}
          {apiError && (
            <div
              className="mb-4 px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2"
              style={{
                backgroundColor: "rgba(212, 116, 112, 0.15)",
                border: "1px solid rgba(212, 116, 112, 0.3)",
                color: "#e09a96",
              }}
            >
              <span>⚠</span>
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Username or Email */}
            <div>
              <label className="block text-xs font-medium mb-1.5 text-[#a0a2a8]">
                Username or E-mail
              </label>
              <input
                type="text"
                placeholder="Username or E-mail"
                {...register("identifier")}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-[#6b6e76] outline-none transition-all duration-200"
                style={{
                  backgroundColor: "#202226",
                  border: `1px solid ${errors.identifier ? "#d47470" : "#2e3035"}`,
                }}
                onFocus={(e) => !errors.identifier && (e.target.style.borderColor = "#e2a24a")}
                onBlur={(e) => !errors.identifier && (e.target.style.borderColor = "#2e3035")}
              />
              {errors.identifier && (
                <p className="mt-1 text-[11px]" style={{ color: "#d47470" }}>
                  {errors.identifier.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#a0a2a8]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-[#7c7f86] hover:text-[#e2a24a] transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  {...register("password")}
                  className="w-full px-3 py-2.5 pr-12 rounded-lg text-sm text-white placeholder-[#6b6e76] outline-none transition-all duration-200"
                  style={{
                    backgroundColor: "#202226",
                    border: `1px solid ${errors.password ? "#d47470" : "#2e3035"}`,
                  }}
                  onFocus={(e) => !errors.password && (e.target.style.borderColor = "#e2a24a")}
                  onBlur={(e) => !errors.password && (e.target.style.borderColor = "#2e3035")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9a9ca3] hover:text-[#e6e7ea] transition-colors cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px]" style={{ color: "#d47470" }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* LeetCode Orange Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg font-semibold text-sm mt-3 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
              style={{
                backgroundColor: isLoading ? "#2c2e33" : "#e2a24a",
                color: isLoading ? "#7c7f86" : "#121315",
                cursor: isLoading ? "not-allowed" : "pointer",
                boxShadow: isLoading ? "none" : "0 2px 8px rgba(226, 162, 74, 0.2)",
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = "#d39540";
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = "#e2a24a";
              }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ backgroundColor: "#2c2e33" }} />
            <span className="text-xs text-[#7c7f86]">or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "#2c2e33" }} />
          </div>

          {/* Link to Signup */}
          <p className="text-center text-xs text-[#9a9ca3]">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-medium hover:underline transition-colors"
              style={{ color: "#e2a24a" }}
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] mt-6 text-[#6b6e76]">
          This site is protected by reCAPTCHA and the Google{" "}
          <span className="cursor-pointer hover:underline text-[#7c7f86]">
            Privacy Policy
          </span>{" "}
          and{" "}
          <span className="cursor-pointer hover:underline text-[#7c7f86]">
            Terms of Service
          </span>{" "}
          apply.
        </p>
      </div>
    </div>
  );
}
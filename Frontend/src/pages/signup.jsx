import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../api/axios";
import CodeHubLogo from "../components/CodeHubLogo";

// ─── Zod Validation Schema ──────────────────────────────────────────────────
const signupSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(3, "First name must be at least 3 characters")
      .max(20, "First name cannot exceed 20 characters"),
    lastName: z
      .string()
      .trim()
      .max(20, "Last name cannot exceed 20 characters")
      .refine((v) => v === "" || v.length >= 3, "Last name must be at least 3 characters")
      .optional(),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username cannot exceed 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(32, "Password cannot exceed 32 characters")
      .regex(/[A-Z]/, "Need at least one uppercase letter")
      .regex(/[a-z]/, "Need at least one lowercase letter")
      .regex(/[0-9]/, "Need at least one number")
      .regex(/[^a-zA-Z0-9]/, "Need at least one special character"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Password Strength Component (LeetCode Difficulty Colors) ───────────────
const PasswordStrength = ({ password = "" }) => {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Lowercase", pass: /[a-z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Special char", pass: /[^a-zA-Z0-9]/.test(password) },
  ];

  const strength = checks.filter((c) => c.pass).length;
  // LeetCode colors: Easy (#5fb39f), Medium (#d6b45f), Hard (#d47470)
  const strengthLabel = ["", "Weak", "Weak", "Medium", "Good", "Strong"][strength];
  const strengthColor = ["", "#d47470", "#d47470", "#d6b45f", "#e2a24a", "#5fb39f"][strength];

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1.5">
        {checks.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i < strength ? strengthColor : "#2c2e33" }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        {checks.map((c) => (
          <span
            key={c.label}
            className="text-[11px] flex items-center gap-1 transition-colors duration-200"
            style={{ color: c.pass ? "#5fb39f" : "#7c7f86" }}
          >
            <span>{c.pass ? "✓" : "○"}</span>
            {c.label}
          </span>
        ))}
      </div>
      {password.length > 0 && (
        <p className="text-xs font-semibold" style={{ color: strengthColor }}>
          {strengthLabel}
        </p>
      )}
    </div>
  );
};

// ─── Signup Page (LeetCode Dark Theme) ───────────────────────────────────────
export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register,handleSubmit, watch, formState: { errors }, } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  const passwordValue = watch("password", "");

  const onSubmit = async (data) => {
    setApiError("");
    setIsLoading(true);
    try {
      await api.post("/auth/register", {
        firstName: data.firstName,
        // lastName is optional on the backend; send it only when filled in
        ...(data.lastName ? { lastName: data.lastName } : {}),
        username: data.username,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      const msg =
        err.response?.data?.details?.[0]?.message ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Registration failed. Please try again.";
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
        {/* LeetCode Style Logo */}
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
            Create Account
          </h1>

          {/* Error Message */}
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
            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-[#a0a2a8]">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="First name"
                  {...register("firstName")}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-[#6b6e76] outline-none transition-all duration-200"
                  style={{
                    backgroundColor: "#202226",
                    border: `1px solid ${errors.firstName ? "#d47470" : "#2e3035"}`,
                  }}
                  onFocus={(e) => !errors.firstName && (e.target.style.borderColor = "#e2a24a")}
                  onBlur={(e) => !errors.firstName && (e.target.style.borderColor = "#2e3035")}
                />
                {errors.firstName && (
                  <p className="mt-1 text-[11px]" style={{ color: "#d47470" }}>
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 text-[#a0a2a8]">
                  Last Name <span className="text-[#6b6e76]">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Last name"
                  {...register("lastName")}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-[#6b6e76] outline-none transition-all duration-200"
                  style={{
                    backgroundColor: "#202226",
                    border: `1px solid ${errors.lastName ? "#d47470" : "#2e3035"}`,
                  }}
                  onFocus={(e) => !errors.lastName && (e.target.style.borderColor = "#e2a24a")}
                  onBlur={(e) => !errors.lastName && (e.target.style.borderColor = "#2e3035")}
                />
                {errors.lastName && (
                  <p className="mt-1 text-[11px]" style={{ color: "#d47470" }}>
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-medium mb-1.5 text-[#a0a2a8]">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#7c7f86]">
                  @
                </span>
                <input
                  type="text"
                  placeholder="Username"
                  {...register("username")}
                  className="w-full pl-8 pr-3 py-2.5 rounded-lg text-sm text-white placeholder-[#6b6e76] outline-none transition-all duration-200"
                  style={{
                    backgroundColor: "#202226",
                    border: `1px solid ${errors.username ? "#d47470" : "#2e3035"}`,
                  }}
                  onFocus={(e) => !errors.username && (e.target.style.borderColor = "#e2a24a")}
                  onBlur={(e) => !errors.username && (e.target.style.borderColor = "#2e3035")}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-[11px]" style={{ color: "#d47470" }}>
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1.5 text-[#a0a2a8]">
                E-mail Address
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                {...register("email")}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-[#6b6e76] outline-none transition-all duration-200"
                style={{
                  backgroundColor: "#202226",
                  border: `1px solid ${errors.email ? "#d47470" : "#2e3035"}`,
                }}
                onFocus={(e) => !errors.email && (e.target.style.borderColor = "#e2a24a")}
                onBlur={(e) => !errors.email && (e.target.style.borderColor = "#2e3035")}
              />
              {errors.email && (
                <p className="mt-1 text-[11px]" style={{ color: "#d47470" }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5 text-[#a0a2a8]">
                Password
              </label>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9a9ca3] hover:text-[#e6e7ea] transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <PasswordStrength password={passwordValue} />
              {errors.password && (
                <p className="mt-1 text-[11px]" style={{ color: "#d47470" }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5 text-[#a0a2a8]">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm password"
                  {...register("confirmPassword")}
                  className="w-full px-3 py-2.5 pr-12 rounded-lg text-sm text-white placeholder-[#6b6e76] outline-none transition-all duration-200"
                  style={{
                    backgroundColor: "#202226",
                    border: `1px solid ${errors.confirmPassword ? "#d47470" : "#2e3035"}`,
                  }}
                  onFocus={(e) =>
                    !errors.confirmPassword && (e.target.style.borderColor = "#e2a24a")
                  }
                  onBlur={(e) =>
                    !errors.confirmPassword && (e.target.style.borderColor = "#2e3035")
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9a9ca3] hover:text-[#e6e7ea] transition-colors"
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-[11px]" style={{ color: "#d47470" }}>
                  {errors.confirmPassword.message}
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
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Sign Up</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ backgroundColor: "#2c2e33" }} />
            <span className="text-xs text-[#7c7f86]">or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "#2c2e33" }} />
          </div>

          {/* Sign in link */}
          <p className="text-center text-xs text-[#9a9ca3]">
            Have an account?{" "}
            <Link
              to="/login"
              className="font-medium hover:underline transition-colors"
              style={{ color: "#e2a24a" }}
            >
              Sign In
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
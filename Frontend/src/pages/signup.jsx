import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../api/axios";
import CodeHubLogo from "../components/CodeHubLogo";
import ThemeToggle from "../components/ThemeToggle";

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

const STRENGTH_BAR = ["", "bg-danger", "bg-danger", "bg-warning", "bg-primary", "bg-success"];
const STRENGTH_TEXT = ["", "text-danger-fg", "text-danger-fg", "text-warning-fg", "text-primary", "text-success-fg"];

const PasswordStrength = ({ password = "" }) => {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Lowercase", pass: /[a-z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Special char", pass: /[^a-zA-Z0-9]/.test(password) },
  ];

  const strength = checks.filter((c) => c.pass).length;
  const strengthLabel = ["", "Weak", "Weak", "Medium", "Good", "Strong"][strength];

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {checks.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-sm transition-colors duration-300 ${
              i < strength ? STRENGTH_BAR[strength] : "bg-line"
            }`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5">
        {checks.map((c) => (
          <span
            key={c.label}
            className={`text-[12px] leading-4 flex items-center gap-1 transition-colors duration-200 ${
              c.pass ? "text-success-fg" : "text-fg-subtle"
            }`}
          >
            <span aria-hidden="true">{c.pass ? "✓" : "○"}</span>
            {c.label}
          </span>
        ))}
      </div>
      {password.length > 0 && (
        <p className={`text-body-sm font-semibold ${STRENGTH_TEXT[strength]}`}>
          {strengthLabel}
        </p>
      )}
    </div>
  );
};

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-canvas">
      <ThemeToggle className="fixed top-4 right-4" />

      <div className="w-full max-w-[440px]">
        <div className="flex flex-col items-center mb-6">
          <CodeHubLogo />
          <p className="mt-2 text-body-sm text-fg-muted">
            A New Way to Learn & Master Algorithms
          </p>
        </div>

        <div className="card p-8">
          <h1 className="text-headline-sm text-fg mb-5">
            Create Account
          </h1>

          {apiError && (
            <div className="alert alert-error mb-4" role="alert">
              <span aria-hidden="true">⚠</span>
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-body-sm font-medium text-fg-body mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="First name"
                  {...register("firstName")}
                  className={`input ${errors.firstName ? "input-error" : ""}`}
                />
                {errors.firstName && (
                  <p className="mt-1.5 text-body-sm text-danger-fg">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-body-sm font-medium text-fg-body mb-1.5">
                  Last Name <span className="font-normal text-fg-subtle">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Last name"
                  {...register("lastName")}
                  className={`input ${errors.lastName ? "input-error" : ""}`}
                />
                {errors.lastName && (
                  <p className="mt-1.5 text-body-sm text-danger-fg">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-body-sm font-medium text-fg-body mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-code-md text-fg-subtle pointer-events-none">
                  @
                </span>
                <input
                  type="text"
                  placeholder="Username"
                  {...register("username")}
                  className={`input pl-8 ${errors.username ? "input-error" : ""}`}
                />
              </div>
              {errors.username && (
                <p className="mt-1.5 text-body-sm text-danger-fg">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-body-sm font-medium text-fg-body mb-1.5">
                E-mail Address
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                {...register("email")}
                className={`input ${errors.email ? "input-error" : ""}`}
              />
              {errors.email && (
                <p className="mt-1.5 text-body-sm text-danger-fg">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-body-sm font-medium text-fg-body mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  {...register("password")}
                  className={`input pr-14 ${errors.password ? "input-error" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 px-2 rounded text-body-sm font-medium text-fg-muted hover:text-fg hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <PasswordStrength password={passwordValue} />
              {errors.password && (
                <p className="mt-1.5 text-body-sm text-danger-fg">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-body-sm font-medium text-fg-body mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm password"
                  {...register("confirmPassword")}
                  className={`input pr-14 ${errors.confirmPassword ? "input-error" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 px-2 rounded text-body-sm font-medium text-fg-muted hover:text-fg hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-body-sm text-danger-fg">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-lg w-full mt-2"
            >
              {isLoading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Sign Up</span>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="divider flex-1" />
            <span className="text-body-sm text-fg-subtle">or</span>
            <div className="divider flex-1" />
          </div>

          <p className="text-center text-body-sm text-fg-muted">
            Have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary-hover hover:underline transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>

        <p className="text-center text-[12px] leading-4 mt-6 text-fg-subtle">
          This site is protected by reCAPTCHA and the Google{" "}
          <span className="cursor-pointer hover:underline text-fg-muted">
            Privacy Policy
          </span>{" "}
          and{" "}
          <span className="cursor-pointer hover:underline text-fg-muted">
            Terms of Service
          </span>{" "}
          apply.
        </p>
      </div>
    </div>
  );
}

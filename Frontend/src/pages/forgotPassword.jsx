import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../api/axios";
import CodeHubLogo from "../components/CodeHubLogo";
import ThemeToggle from "../components/ThemeToggle";

const RESEND_COOLDOWN = 60;

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

const resetSchema = z
  .object({
    otp: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Enter the 6-digit code"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(32, "Password cannot exceed 32 characters")
      .regex(/[A-Z]/, "Need at least one uppercase letter")
      .regex(/[a-z]/, "Need at least one lowercase letter")
      .regex(/[0-9]/, "Need at least one number")
      .regex(/[^a-zA-Z0-9]/, "Need at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const errorMessage = (err, fallback) =>
  err.response?.data?.details?.[0]?.message ||
  err.response?.data?.error ||
  err.response?.data?.message ||
  fallback;

function Alert({ tone, children }) {
  const isError = tone === "error";
  return (
    <div className={`alert ${isError ? "alert-error" : "alert-success"} mb-4`} role={isError ? "alert" : "status"}>
      <span aria-hidden="true">{isError ? "⚠" : "✓"}</span>
      <span>{children}</span>
    </div>
  );
}

function Field({ label, error, inputProps, right, inputClassName = "" }) {
  return (
    <div>
      <label className="block text-body-sm font-medium text-fg-body mb-1.5">{label}</label>
      <div className="relative">
        <input
          {...inputProps}
          className={`input ${right ? "pr-14" : ""} ${error ? "input-error" : ""} ${inputClassName}`}
        />
        {right}
      </div>
      {error && (
        <p className="mt-1.5 text-body-sm text-danger-fg">
          {error.message}
        </p>
      )}
    </div>
  );
}

function SubmitButton({ isLoading, label, loadingLabel }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="btn btn-primary btn-lg w-full mt-2"
    >
      {isLoading && <span className="spinner" aria-hidden="true" />}
      <span>{isLoading ? loadingLabel : label}</span>
    </button>
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();

  // "email" → ask for the address, "reset" → code + new password
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [apiError, setApiError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const emailForm = useForm({ resolver: zodResolver(emailSchema), mode: "onChange" });
  const resetForm = useForm({ resolver: zodResolver(resetSchema), mode: "onChange" });

  const requestCode = async (address) => {
    setApiError("");
    setIsLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: address });
      setEmail(address);
      setNotice(res.data?.message || "If an account exists for that email, a reset code has been sent.");
      setCooldown(RESEND_COOLDOWN);
      setStep("reset");
    } catch (err) {
      setApiError(errorMessage(err, "Could not send the reset code. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data) => {
    setApiError("");
    setNotice("");
    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", { email, ...data });
      navigate("/login", { state: { passwordReset: true } });
    } catch (err) {
      setApiError(errorMessage(err, "Could not reset your password. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-canvas">
      <ThemeToggle className="fixed top-4 right-4" />

      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-6">
          <CodeHubLogo />
          <p className="mt-2 text-body-sm text-fg-muted">
            A New Way to Learn & Master Algorithms
          </p>
        </div>

        <div className="card p-8">
          <h1 className="text-headline-sm text-fg mb-1.5">Reset Password</h1>
          <p className="text-body-sm text-fg-muted mb-5">
            {step === "email"
              ? "Enter the email on your account and we'll send you a 6-digit code."
              : <>Enter the code sent to <span className="font-medium text-fg">{email}</span> and choose a new password. Can&apos;t find it? Check your spam folder.</>}
          </p>

          {apiError && <Alert tone="error">{apiError}</Alert>}
          {notice && !apiError && <Alert tone="success">{notice}</Alert>}

          {step === "email" ? (
            <form onSubmit={emailForm.handleSubmit((d) => requestCode(d.email))} className="space-y-4">
              <Field
                label="E-mail"
                error={emailForm.formState.errors.email}
                inputProps={{ type: "email", placeholder: "you@example.com", autoFocus: true, ...emailForm.register("email") }}
              />
              <SubmitButton isLoading={isLoading} label="Send Code" loadingLabel="Sending..." />
            </form>
          ) : (
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
              <Field
                label="Verification Code"
                error={resetForm.formState.errors.otp}
                inputProps={{
                  type: "text",
                  inputMode: "numeric",
                  autoComplete: "one-time-code",
                  maxLength: 6,
                  placeholder: "6-digit code",
                  autoFocus: true,
                  ...resetForm.register("otp"),
                }}
                inputClassName="h-10 font-mono text-[16px] font-medium tracking-[0.4em] placeholder:font-sans placeholder:tracking-normal"
              />
              <Field
                label="New Password"
                error={resetForm.formState.errors.newPassword}
                inputProps={{
                  type: showPassword ? "text" : "password",
                  placeholder: "New password",
                  autoComplete: "new-password",
                  ...resetForm.register("newPassword"),
                }}
                right={
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 px-2.5 rounded-full text-body-sm font-medium text-fg-muted hover:text-fg hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                }
              />
              <Field
                label="Confirm New Password"
                error={resetForm.formState.errors.confirmPassword}
                inputProps={{
                  type: showPassword ? "text" : "password",
                  placeholder: "Confirm new password",
                  autoComplete: "new-password",
                  ...resetForm.register("confirmPassword"),
                }}
              />
              <SubmitButton isLoading={isLoading} label="Reset Password" loadingLabel="Resetting..." />

              <div className="flex items-center justify-between text-body-sm pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setApiError("");
                    setNotice("");
                    resetForm.reset();
                  }}
                  className="text-fg-muted hover:text-primary transition-colors cursor-pointer"
                >
                  Use a different email
                </button>
                <button
                  type="button"
                  disabled={cooldown > 0 || isLoading}
                  onClick={() => requestCode(email)}
                  className="font-medium tabular-nums text-primary hover:text-primary-hover disabled:text-fg-subtle disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                </button>
              </div>
            </form>
          )}

          <div className="flex items-center gap-3 my-5">
            <div className="divider flex-1" />
            <span className="text-body-sm text-fg-subtle">or</span>
            <div className="divider flex-1" />
          </div>

          <p className="text-center text-body-sm text-fg-muted">
            Remembered it?{" "}
            <Link to="/login" className="font-medium text-primary hover:text-primary-hover hover:underline transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

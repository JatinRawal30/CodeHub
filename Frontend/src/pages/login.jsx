import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import api from "../api/axios";
import { setCredentials } from "../store/slices/authSlice";
import CodeHubLogo from "../components/CodeHubLogo";
import ThemeToggle from "../components/ThemeToggle";

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Email or Username is required"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // set when signup redirects here
  const registeredSuccess = location.state?.registered;
  // set when the forgot-password page redirects here
  const passwordResetSuccess = location.state?.passwordReset;

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

      // token is kept in memory only, never localStorage
      if (res.data?.accessToken) {
        dispatch(
          setCredentials({
            user: res.data.user,
            accessToken: res.data.accessToken,
          })
        );
      }

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
          <h1 className="text-headline-sm text-fg mb-5">
            Sign In
          </h1>

          {registeredSuccess && !apiError && (
            <div className="alert alert-success mb-4" role="status">
              <span aria-hidden="true">✓</span>
              <span>Account created successfully! Please sign in.</span>
            </div>
          )}

          {passwordResetSuccess && !apiError && (
            <div className="alert alert-success mb-4" role="status">
              <span aria-hidden="true">✓</span>
              <span>Password reset. Please sign in with your new password.</span>
            </div>
          )}

          {apiError && (
            <div className="alert alert-error mb-4" role="alert">
              <span aria-hidden="true">⚠</span>
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-body-sm font-medium text-fg-body mb-1.5">
                Username or E-mail
              </label>
              <input
                type="text"
                placeholder="Username or E-mail"
                {...register("identifier")}
                className={`input ${errors.identifier ? "input-error" : ""}`}
              />
              {errors.identifier && (
                <p className="mt-1.5 text-body-sm text-danger-fg">
                  {errors.identifier.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-body-sm font-medium text-fg-body">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-body-sm text-fg-muted hover:text-primary transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
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
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 px-2.5 rounded-full text-body-sm font-medium text-fg-muted hover:text-fg hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-body-sm text-danger-fg">
                  {errors.password.message}
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
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="divider flex-1" />
            <span className="text-body-sm text-fg-subtle">or</span>
            <div className="divider flex-1" />
          </div>

          <p className="text-center text-body-sm text-fg-muted">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-primary hover:text-primary-hover hover:underline transition-colors"
            >
              Sign Up
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

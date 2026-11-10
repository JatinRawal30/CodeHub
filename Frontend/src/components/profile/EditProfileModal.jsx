import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { changeMyPassword, updateMyProfile } from "../../api/profile";
import { getApiErrorMessage } from "../../api/execution";
import { LANGUAGES } from "../../constants/languages";
import AvatarPicker from "./AvatarPicker";
import { setAccessToken } from "../../store/slices/authSlice";

// Same rules as the backend (updateProfileValidation / changePasswordValidation)
const profileSchema = z.object({
  firstName: z.string().trim().min(3, "At least 3 characters").max(20, "At most 20 characters"),
  lastName: z
    .string()
    .trim()
    .max(20, "At most 20 characters")
    .refine((v) => v === "" || v.length >= 3, "At least 3 characters (or leave empty)"),
  bio: z.string().max(200, "At most 200 characters"),
  languagePreferences: z.array(z.string()),
});

const passwordRule = z
  .string()
  .min(8, "At least 8 characters")
  .max(32, "At most 32 characters")
  .regex(/[A-Z]/, "Needs an uppercase letter")
  .regex(/[a-z]/, "Needs a lowercase letter")
  .regex(/[0-9]/, "Needs a number")
  .regex(/[^a-zA-Z0-9]/, "Needs a special character");

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] })
  .refine((d) => d.newPassword !== d.oldPassword, { message: "Must differ from the current password", path: ["newPassword"] });

const inputClass = "input";
const borderFor = (hasError) => (hasError ? "input-error" : "");

function Field({ label, error, hint, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex justify-between text-body-sm font-medium text-fg">
        {label}
        {hint && <span className="font-normal text-code-sm text-fg-subtle">{hint}</span>}
      </span>
      {children}
      {error && <span className="block text-body-sm text-danger-fg">{error}</span>}
    </label>
  );
}

function Banner({ tone, children }) {
  const styles = tone === "success" ? "alert-success" : "alert-error";
  return <div className={`alert ${styles}`}>{children}</div>;
}

function SaveButton({ isSaving, children }) {
  return (
    <button
      type="submit"
      disabled={isSaving}
      className="btn btn-primary"
    >
      {isSaving ? "Saving…" : children}
    </button>
  );
}

function ProfileForm({ profile, onSaved }) {
  const [status, setStatus] = useState(null); // { tone, message }
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      bio: profile.bio || "",
      languagePreferences: profile.languagePreferences || [],
    },
  });

  const bio = watch("bio") || "";
  const selectedLanguages = watch("languagePreferences") || [];

  const toggleLanguage = (id) => {
    const next = selectedLanguages.includes(id)
      ? selectedLanguages.filter((l) => l !== id)
      : [...selectedLanguages, id];
    setValue("languagePreferences", next, { shouldDirty: true });
  };

  const onSubmit = async (data) => {
    setStatus(null);
    try {
      await updateMyProfile(data);
      setStatus({ tone: "success", message: "Profile updated." });
      onSaved();
    } catch (err) {
      setStatus({ tone: "error", message: getApiErrorMessage(err, "Could not update your profile.") });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {status && <Banner tone={status.tone}>{status.message}</Banner>}

      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" error={errors.firstName?.message}>
          <input {...register("firstName")} className={`${inputClass} ${borderFor(errors.firstName)}`} />
        </Field>
        <Field label="Last name" error={errors.lastName?.message}>
          <input {...register("lastName")} placeholder="Optional" className={`${inputClass} ${borderFor(errors.lastName)}`} />
        </Field>
      </div>

      <Field label="Bio" error={errors.bio?.message} hint={`${bio.length}/200`}>
        <textarea
          {...register("bio")}
          rows={3}
          placeholder="Tell others a little about yourself"
          className={`${inputClass} resize-none ${borderFor(errors.bio)}`}
        />
      </Field>

      <div className="space-y-1.5">
        <span className="block text-body-sm font-medium text-fg">Preferred languages</span>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => {
            const isOn = selectedLanguages.includes(l.id);
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => toggleLanguage(l.id)}
                aria-pressed={isOn}
                className={`h-7 px-2.5 rounded text-body-sm border transition-colors cursor-pointer ${
                  isOn
                    ? "bg-primary-soft border-primary-soft-line text-primary-soft-fg"
                    : "bg-surface border-line-strong text-fg-body hover:bg-surface-hover hover:border-fg-subtle"
                }`}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <SaveButton isSaving={isSubmitting}>Save changes</SaveButton>
      </div>
    </form>
  );
}

function PasswordForm() {
  const dispatch = useDispatch();
  const [status, setStatus] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(passwordSchema) });

  const onSubmit = async (data) => {
    setStatus(null);
    try {
      const { accessToken } = await changeMyPassword(data);
      dispatch(setAccessToken(accessToken)); // this device stays signed in
      reset();
      setStatus({ tone: "success", message: "Password changed. Your other devices were signed out." });
    } catch (err) {
      setStatus({ tone: "error", message: getApiErrorMessage(err, "Could not change your password.") });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {status && <Banner tone={status.tone}>{status.message}</Banner>}
      <Field label="Current password" error={errors.oldPassword?.message}>
        <input type="password" autoComplete="current-password" {...register("oldPassword")} className={`${inputClass} ${borderFor(errors.oldPassword)}`} />
      </Field>
      <Field label="New password" error={errors.newPassword?.message}>
        <input type="password" autoComplete="new-password" {...register("newPassword")} className={`${inputClass} ${borderFor(errors.newPassword)}`} />
      </Field>
      <Field label="Confirm new password" error={errors.confirmPassword?.message}>
        <input type="password" autoComplete="new-password" {...register("confirmPassword")} className={`${inputClass} ${borderFor(errors.confirmPassword)}`} />
      </Field>
      <p className="text-body-sm text-fg-muted">8–32 characters with uppercase, lowercase, a number and a special character.</p>
      <div className="flex justify-end pt-2">
        <SaveButton isSaving={isSubmitting}>Change password</SaveButton>
      </div>
    </form>
  );
}

// `profile` is the logged-in user's private profile (state.auth.profile)
export default function EditProfileModal({ isOpen, onClose, profile, onSaved }) {
  const [tab, setTab] = useState("profile");

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-backdrop backdrop-blur-[2px] flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="card shadow-overlay w-full max-w-lg max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 id="edit-profile-title" className="text-headline-sm text-fg">Edit Profile</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="btn btn-ghost btn-sm btn-icon w-8"
          >
            ✕
          </button>
        </div>

        <div className="px-6 flex gap-1 border-b border-line">
          {[
            { id: "profile", label: "Profile" },
            { id: "password", label: "Password" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-3 py-2.5 text-body-md font-medium transition-colors cursor-pointer ${
                tab === t.id ? "text-fg" : "text-fg-muted hover:text-fg"
              }`}
            >
              {t.label}
              {tab === t.id && <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-primary" />}
            </button>
          ))}
        </div>

        <div className="px-6 py-5 overflow-y-auto">
          {!profile ? (
            <div className="flex justify-center py-8">
              <span className="spinner w-6 h-6 text-primary" />
            </div>
          ) : tab === "profile" ? (
            <>
              <AvatarPicker avatar={profile.avatar} name={profile.name || profile.username} onChanged={onSaved} />
              <ProfileForm profile={profile} onSaved={onSaved} />
            </>
          ) : (
            <PasswordForm />
          )}
        </div>
      </div>
    </div>
  );
}

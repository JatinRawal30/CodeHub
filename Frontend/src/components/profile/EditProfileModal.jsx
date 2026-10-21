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

const inputClass =
  "w-full px-3 py-2 rounded-lg text-sm text-white placeholder-[#6b6e76] bg-[#151619] border outline-none transition-colors";
const borderFor = (hasError) => (hasError ? "border-[#d47470]" : "border-[#2c2e33] focus:border-[#e2a24a]");

function Field({ label, error, hint, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex justify-between text-xs font-medium text-[#a0a2a8]">
        {label}
        {hint && <span className="font-normal text-[#767980]">{hint}</span>}
      </span>
      {children}
      {error && <span className="block text-[11px] text-[#d47470]">{error}</span>}
    </label>
  );
}

function Banner({ tone, children }) {
  const styles =
    tone === "success"
      ? "bg-[#68b582]/10 border-[#68b582]/30 text-[#86c49c]"
      : "bg-[#d47470]/10 border-[#d47470]/30 text-[#e09a96]";
  return <div className={`px-3 py-2 rounded-lg border text-xs ${styles}`}>{children}</div>;
}

function SaveButton({ isSaving, children }) {
  return (
    <button
      type="submit"
      disabled={isSaving}
      className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#e2a24a] text-[#121315] hover:bg-[#d39540] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
        <span className="block text-xs font-medium text-[#a0a2a8]">Preferred languages</span>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => {
            const isOn = selectedLanguages.includes(l.id);
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => toggleLanguage(l.id)}
                aria-pressed={isOn}
                className={`px-3 py-1 rounded-full text-xs border transition-colors cursor-pointer ${
                  isOn
                    ? "bg-[#e2a24a]/15 border-[#e2a24a]/50 text-[#e2a24a]"
                    : "bg-[#151619] border-[#2c2e33] text-[#c4c6cb] hover:border-[#3a3d44]"
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
      <p className="text-[11px] text-[#767980]">8–32 characters with uppercase, lowercase, a number and a special character.</p>
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
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="bg-[#1a1b1f] border border-[#2e3035] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 id="edit-profile-title" className="text-lg font-semibold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-[#9a9ca3] hover:text-white p-1 rounded-lg hover:bg-[#2a2c31] transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="px-6 flex gap-1 border-b border-[#2a2c31]">
          {[
            { id: "profile", label: "Profile" },
            { id: "password", label: "Password" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                tab === t.id ? "text-white" : "text-[#9a9ca3] hover:text-white"
              }`}
            >
              {t.label}
              {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e2a24a] rounded-full" />}
            </button>
          ))}
        </div>

        <div className="px-6 py-5 overflow-y-auto">
          {!profile ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-[#e2a24a] border-t-transparent rounded-full" />
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

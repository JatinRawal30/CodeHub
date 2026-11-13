import { useState } from "react";
import { useForm } from "react-hook-form";
import Field from "./Field";
import { applyServerErrors, registerAdmin } from "../../api/admin";
import { getApiErrorMessage } from "../../api/execution";

// The backend owns the rules (name and username lengths, password strength, matching passwords);
// its messages are shown under the fields.
export default function AddAdminForm() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();
  const [notice, setNotice] = useState(null);

  const onSubmit = async (values) => {
    setNotice(null);
    try {
      const { lastName, ...account } = values;
      // an empty optional last name would fail the 3-character minimum
      const admin = await registerAdmin(lastName.trim() ? { ...account, lastName: lastName.trim() } : account);
      reset();
      setNotice({ type: "success", text: `Admin account created for @${admin.username}. They can sign in now.` });
    } catch (err) {
      if (applyServerErrors(err, setError)) {
        setNotice({ type: "error", text: "Fix the fields marked below, then try again." });
      } else {
        setNotice({ type: "error", text: getApiErrorMessage(err, "Couldn't create the admin account.") });
      }
    }
  };

  const input = (name, options) => ({
    ...register(name, options),
    className: `input ${errors[name] ? "input-error" : ""}`,
  });
  const required = { required: "Required" };

  return (
    <section className="max-w-xl">
      <h2 className="text-headline-sm">Add an admin</h2>
      <p className="mt-1 text-body-md text-fg-muted">
        Creates a new account that can add, edit and delete problems and create other admins.
      </p>

      {notice && (
        <div className={`alert mt-6 ${notice.type === "error" ? "alert-error" : "alert-success"}`} role={notice.type === "error" ? "alert" : "status"}>
          {notice.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" error={errors.firstName?.message}>
            <input type="text" autoComplete="off" {...input("firstName", required)} />
          </Field>
          <Field label="Last name" hint="(optional)" error={errors.lastName?.message}>
            <input type="text" autoComplete="off" {...input("lastName")} />
          </Field>
        </div>
        <Field label="Username" error={errors.username?.message}>
          <input type="text" autoComplete="off" spellCheck={false} {...input("username", required)} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input type="email" autoComplete="off" {...input("email", required)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" error={errors.password?.message}>
            <input type="password" autoComplete="new-password" {...input("password", required)} />
          </Field>
          <Field label="Confirm password" error={errors.confirmPassword?.message}>
            <input type="password" autoComplete="new-password" {...input("confirmPassword", required)} />
          </Field>
        </div>
        <p className="text-body-sm text-fg-muted">
          Passwords need 8 to 32 characters with an uppercase letter, a lowercase letter, a number and a symbol.
        </p>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting && <span className="spinner h-3.5 w-3.5" aria-hidden="true" />}
          Create admin
        </button>
      </form>
    </section>
  );
}

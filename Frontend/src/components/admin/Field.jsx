// Label, control and error message for one form field. The control goes in as children.
export default function Field({ label, hint, error, className = "", children }) {
  return (
    <div className={className}>
      <label className="block">
        <span className="mb-1.5 block text-body-sm font-medium text-fg-body">
          {label}
          {hint && <span className="font-normal text-fg-muted"> {hint}</span>}
        </span>
        {children}
      </label>
      {error && (
        <p className="mt-1.5 text-body-sm text-danger-fg" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

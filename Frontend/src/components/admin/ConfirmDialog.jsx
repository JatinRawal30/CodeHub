import { useEffect, useRef } from "react";

// Native <dialog>: the focus trap, Esc to close and the backdrop come from the browser
export default function ConfirmDialog({ open, title, body, confirmLabel, isBusy = false, onConfirm, onCancel }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const cancel = () => {
    if (!isBusy) onCancel();
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault(); // close through state, so `open` stays the single source of truth
        cancel();
      }}
      onClick={(e) => e.target === dialogRef.current && cancel()} // a click on the backdrop
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line-strong bg-surface p-6 text-fg-body shadow-overlay backdrop:bg-backdrop backdrop:backdrop-blur-sm"
    >
      <h2 className="text-headline-sm">{title}</h2>
      <p className="mt-2 text-body-md text-fg-muted">{body}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" className="btn btn-secondary" onClick={cancel} disabled={isBusy}>
          Cancel
        </button>
        <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={isBusy}>
          {isBusy && <span className="spinner h-3.5 w-3.5" aria-hidden="true" />}
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}

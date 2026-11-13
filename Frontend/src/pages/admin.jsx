import { useState } from "react";
import AdminShell from "../components/admin/AdminShell";
import ProblemManager from "../components/admin/ProblemManager";
import AddAdminForm from "../components/admin/AddAdminForm";

const SECTIONS = [
  ["problems", "Problems"],
  ["admins", "Admins"],
];

export default function AdminPage() {
  const [section, setSection] = useState("problems");

  return (
    <AdminShell>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-headline-lg">Admin</h1>
        <div role="tablist" aria-label="Admin sections" className="flex gap-1">
          {SECTIONS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={section === id}
              onClick={() => setSection(id)}
              className={`cursor-pointer rounded-full px-4 py-2 text-[0.95rem] transition-colors hover:text-fg ${
                section === id ? "bg-surface-hover text-fg" : "text-fg-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {section === "problems" ? <ProblemManager /> : <AddAdminForm />}
    </AdminShell>
  );
}

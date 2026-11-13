import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import AdminShell from "../components/admin/AdminShell";
import ProblemForm from "../components/admin/ProblemForm";
import { EMPTY_PROBLEM, toFormValues } from "../components/admin/problemFormData";
import { fetchFullProblem, fetchNextProblemId } from "../api/admin";
import { getApiErrorMessage } from "../api/execution";

// /admin/problems/new creates; /admin/problems/:problemId edits
export default function AdminProblemPage() {
  const { problemId } = useParams();
  const isEdit = Boolean(problemId);

  // what the last load produced, tagged with the route it was for so a stale result is never shown
  const routeKey = problemId ?? "new";
  const [result, setResult] = useState(null); // { routeKey, original, initialValues } or { routeKey, error }
  const loaded = result?.routeKey === routeKey && !result.error ? result : null;
  const loadError = result?.routeKey === routeKey ? result.error : "";

  useEffect(() => {
    let isMounted = true;

    const load = isEdit
      ? fetchFullProblem(problemId).then((problem) => ({ original: problem, initialValues: toFormValues(problem) }))
      : fetchNextProblemId()
          .catch(() => "") // the ID suggestion is a convenience; the admin can type one
          .then((nextId) => ({ original: null, initialValues: { ...EMPTY_PROBLEM, problemID: nextId } }));

    load
      .catch((err) => ({
        error: err.response?.status === 404 ? `Problem ${problemId} doesn't exist.` : getApiErrorMessage(err, "Couldn't load the problem."),
      }))
      .then((outcome) => isMounted && setResult({ routeKey, ...outcome }));

    return () => {
      isMounted = false;
    };
  }, [isEdit, problemId, routeKey]);

  return (
    <AdminShell>
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-body-md text-fg-muted transition-colors hover:text-fg">
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        All problems
      </Link>
      <h1 className="mb-8 mt-3 text-headline-lg">
        {isEdit ? (loaded ? `Edit “${loaded.original.title}”` : "Edit problem") : "New problem"}
      </h1>

      {loadError ? (
        <p className="alert alert-error max-w-xl" role="alert">
          {loadError}
        </p>
      ) : !loaded ? (
        <span className="spinner h-6 w-6 text-primary" role="status" aria-label="Loading" />
      ) : (
        <ProblemForm key={routeKey} original={loaded.original} initialValues={loaded.initialValues} />
      )}
    </AdminShell>
  );
}

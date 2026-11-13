import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import Field from "./Field";
import CodeByLanguage from "./CodeByLanguage";
import { applyServerErrors, createProblem, updateProblem } from "../../api/admin";
import { getApiErrorMessage } from "../../api/execution";
import { LANGUAGES } from "../../constants/languages";
import { DIFFICULTIES, PROBLEM_TAGS } from "../../constants/problem";
import { toFieldName, toFormValues, toPayload } from "./problemFormData";

const hasCode = (byLang) => LANGUAGES.some((l) => byLang[l.id]?.trim());
const required = { required: "Required" };

function Section({ title, hint, children }) {
  return (
    <section className="mt-10 border-t border-line pt-10 first:mt-0 first:border-0 first:pt-0">
      <h2 className="text-headline-sm">{title}</h2>
      {hint && <p className="mt-1 max-w-2xl text-body-md text-fg-muted">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

// Rows of test cases. Visible ones also carry the explanation shown on the problem page.
function TestCases({ name, cases, register, errors, withExplanation = false }) {
  const textarea = (field, index) => ({
    ...register(`${name}.${index}.${field}`, required),
    rows: 3,
    spellCheck: false,
    className: `input font-mono text-code-md ${errors?.[index]?.[field] ? "input-error" : ""}`,
  });

  return (
    <div className="space-y-6">
      {cases.fields.map((testCase, index) => (
        <div key={testCase.id}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-body-md font-medium text-fg">Case {index + 1}</h3>
            <button
              type="button"
              onClick={() => cases.remove(index)}
              disabled={cases.fields.length === 1}
              title={cases.fields.length === 1 ? "A problem needs at least one case" : undefined}
              className="btn btn-ghost btn-sm enabled:hover:bg-danger-soft enabled:hover:text-danger-fg"
            >
              Remove
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Input" hint="(stdin)" error={errors?.[index]?.input?.message}>
              <textarea {...textarea("input", index)} />
            </Field>
            <Field label="Expected output" hint="(stdout)" error={errors?.[index]?.output?.message}>
              <textarea {...textarea("output", index)} />
            </Field>
          </div>
          {withExplanation && (
            <Field label="Explanation" className="mt-4" error={errors?.[index]?.explanation?.message}>
              <input
                type="text"
                {...register(`${name}.${index}.explanation`, required)}
                className={`input ${errors?.[index]?.explanation ? "input-error" : ""}`}
              />
            </Field>
          )}
        </div>
      ))}

      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => cases.append(withExplanation ? { input: "", output: "", explanation: "" } : { input: "", output: "" })}
      >
        Add a case
      </button>
    </div>
  );
}

// Create (no `original`) or edit a problem. Editing sends only the fields that changed.
export default function ProblemForm({ original = null, initialValues }) {
  const navigate = useNavigate();
  const isEdit = Boolean(original);
  const [formError, setFormError] = useState("");

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: initialValues });
  const visibleCases = useFieldArray({ control, name: "visibleTestCases" });
  const hiddenCases = useFieldArray({ control, name: "hiddenTestCases" });

  const onSubmit = async (values) => {
    setFormError("");
    const payload = toPayload(values, original);

    try {
      if (isEdit) {
        const before = toPayload(toFormValues(original), original);
        const changes = Object.fromEntries(
          Object.entries(payload).filter(
            ([field, value]) => field !== "problemID" && JSON.stringify(value) !== JSON.stringify(before[field])
          )
        );
        if (Object.keys(changes).length === 0) {
          setFormError("Nothing has changed yet.");
          return;
        }
        await updateProblem(original.problemID, changes);
      } else {
        await createProblem(payload);
      }

      navigate("/admin", {
        state: {
          notice: isEdit ? `Saved “${payload.title}”.` : `Created problem ${payload.problemID}, “${payload.title}”.`,
        },
      });
    } catch (err) {
      if (err.response?.status === 409) {
        setError("problemID", { type: "server", message: getApiErrorMessage(err) }, { shouldFocus: true });
        setFormError("That problem ID is taken.");
      } else if (err.response?.status === 413) {
        setFormError("Too large to save: the server accepts about 100 KB per request. Shorten the test cases you changed.");
      } else if (applyServerErrors(err, setError, toFieldName)) {
        setFormError("Fix the fields marked in red, then save again.");
      } else {
        setFormError(getApiErrorMessage(err, "Couldn't save the problem."));
      }
    }
  };

  const inputClass = (name) => `input ${errors[name] ? "input-error" : ""}`;

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () => setFormError("Fix the fields marked in red, then save again."))}
      noValidate
    >
      <Section title="Basics">
        <div className="grid max-w-3xl gap-4 sm:grid-cols-[8rem_1fr]">
          <Field label="Problem ID" error={errors.problemID?.message}>
            <input
              type="number"
              min="1"
              readOnly={isEdit}
              title={isEdit ? "The ID can't change after a problem is created" : undefined}
              {...register("problemID", { ...required, min: { value: 1, message: "Must be 1 or more" } })}
              className={`${inputClass("problemID")} font-mono ${isEdit ? "opacity-60" : ""}`}
            />
          </Field>
          <Field label="Title" error={errors.title?.message}>
            <input
              type="text"
              {...register("title", { ...required, minLength: { value: 3, message: "At least 3 characters" }, maxLength: { value: 200, message: "At most 200 characters" } })}
              className={inputClass("title")}
            />
          </Field>
        </div>

        <div className="mt-4 grid max-w-3xl gap-4 sm:grid-cols-3">
          <Field label="Difficulty" error={errors.difficulty?.message}>
            <select {...register("difficulty")} className={`${inputClass("difficulty")} capitalize`}>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Time limit" hint="(seconds)" error={errors.timeLimit?.message}>
            <input
              type="number"
              step="0.1"
              {...register("timeLimit", { ...required, min: { value: 0.1, message: "Between 0.1 and 10" }, max: { value: 10, message: "Between 0.1 and 10" } })}
              className={`${inputClass("timeLimit")} font-mono`}
            />
          </Field>
          <Field label="Memory limit" hint="(MB)" error={errors.memoryLimit?.message}>
            <input
              type="number"
              step="1"
              {...register("memoryLimit", { ...required, min: { value: 16, message: "Between 16 and 1024" }, max: { value: 1024, message: "Between 16 and 1024" } })}
              className={`${inputClass("memoryLimit")} font-mono`}
            />
          </Field>
        </div>

        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <fieldset className="mt-5">
              <legend className="mb-2 text-body-sm font-medium text-fg-body">Topics</legend>
              <div className="flex max-w-3xl flex-wrap gap-1.5">
                {PROBLEM_TAGS.map((tag) => {
                  const isOn = field.value.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      aria-pressed={isOn}
                      onClick={() => field.onChange(isOn ? field.value.filter((t) => t !== tag) : [...field.value, tag])}
                      className={`cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors ${
                        isOn
                          ? "border-primary-soft-line bg-primary-soft text-primary-soft-fg"
                          : "border-line text-fg-muted hover:border-line-strong hover:text-fg"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              {errors.tags && <p className="mt-1.5 text-body-sm text-danger-fg" role="alert">{errors.tags.message}</p>}
            </fieldset>
          )}
        />
      </Section>

      <Section title="Statement">
        <div className="max-w-3xl space-y-4">
          <Field label="Description" hint="(include the input and output format)" error={errors.description?.message}>
            <textarea
              rows={12}
              {...register("description", { ...required, minLength: { value: 10, message: "At least 10 characters" } })}
              className={inputClass("description")}
            />
          </Field>
          <Field label="Constraints" hint="(one per line)" error={errors.constraints?.message}>
            <textarea rows={4} spellCheck={false} {...register("constraints")} className={`${inputClass("constraints")} font-mono text-code-md`} />
          </Field>
        </div>
      </Section>

      <Section title="Visible test cases" hint="Shown on the problem page as examples, and used by Run.">
        <TestCases name="visibleTestCases" cases={visibleCases} register={register} errors={errors.visibleTestCases} withExplanation />
      </Section>

      <Section title="Hidden test cases" hint="Never shown to users. Submit runs these after the visible ones.">
        <TestCases name="hiddenTestCases" cases={hiddenCases} register={register} errors={errors.hiddenTestCases} />
      </Section>

      <Section title="Reference solutions" hint="A correct solution in at least one language. Users never see these.">
        <Controller
          control={control}
          name="referenceByLang"
          rules={{ validate: (value) => hasCode(value) || "Add a reference solution in at least one language." }}
          render={({ field, fieldState }) => (
            <>
              <CodeByLanguage label="Reference solution" value={field.value} onChange={field.onChange} hasError={Boolean(fieldState.error)} />
              {fieldState.error && <p className="mt-1.5 text-body-sm text-danger-fg" role="alert">{fieldState.error.message}</p>}
            </>
          )}
        />
      </Section>

      <Section title="Starter code" hint="What the editor shows before the user types. Languages left empty fall back to the standard template.">
        <Controller
          control={control}
          name="starterByLang"
          rules={{ validate: (value) => hasCode(value) || "Add starter code in at least one language." }}
          render={({ field, fieldState }) => (
            <>
              <CodeByLanguage label="Starter code" value={field.value} onChange={field.onChange} hasError={Boolean(fieldState.error)} />
              {fieldState.error && <p className="mt-1.5 text-body-sm text-danger-fg" role="alert">{fieldState.error.message}</p>}
            </>
          )}
        />
      </Section>

      {/* stays on screen so Save and any error are always reachable on this long form */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-10 flex flex-wrap items-center justify-end gap-3 border-t border-line bg-canvas/85 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        {formError && (
          <p className="mr-auto text-body-md text-danger-fg" role="alert">
            {formError}
          </p>
        )}
        <Link to="/admin" className="btn btn-ghost hover:bg-surface-hover hover:text-fg">
          Cancel
        </Link>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting && <span className="spinner h-3.5 w-3.5" aria-hidden="true" />}
          {isEdit ? "Save changes" : "Create problem"}
        </button>
      </div>
    </form>
  );
}

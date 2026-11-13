// Mapping between an API problem and the admin problem form's values.
import { LANGUAGES } from "../../constants/languages";

export const EMPTY_PROBLEM = {
  problemID: "",
  title: "",
  description: "",
  difficulty: "easy",
  tags: [],
  constraints: "",
  timeLimit: 1,
  memoryLimit: 256,
  visibleTestCases: [{ input: "", output: "", explanation: "" }],
  hiddenTestCases: [{ input: "", output: "" }],
  referenceByLang: {},
  starterByLang: {},
};

// API problem -> form values. Code is kept as { languageId: code }, merged from the
// single-language field and the per-language list (the list wins).
export function toFormValues(problem) {
  const byLanguage = (single, list, codeKey) =>
    Object.fromEntries(
      [single, ...(list || [])].filter((entry) => entry?.language).map((entry) => [entry.language, entry[codeKey] ?? ""])
    );

  return {
    problemID: problem.problemID,
    title: problem.title,
    description: problem.description,
    difficulty: problem.difficulty,
    tags: problem.tags || [],
    constraints: (problem.constraints || []).join("\n"),
    timeLimit: problem.timeLimit,
    memoryLimit: problem.memoryLimit,
    visibleTestCases: problem.visibleTestCases.map(({ input, output, explanation }) => ({ input, output, explanation })),
    hiddenTestCases: (problem.hiddenTestCases || []).map(({ input, output }) => ({ input, output })),
    referenceByLang: byLanguage(problem.referenceSolution, problem.referenceSolutions, "completeCode"),
    starterByLang: byLanguage(problem.starterCode, problem.starterCodes, "code"),
  };
}

// One entry per language that has code. The schema also wants a single entry:
// the language it already used if that still has code, otherwise the first.
function codeEntries(byLang, currentLanguage, codeKey) {
  const list = LANGUAGES.filter((l) => byLang[l.id]?.trim()).map((l) => ({ language: l.id, [codeKey]: byLang[l.id] }));
  return { list, single: list.find((entry) => entry.language === currentLanguage) || list[0] };
}

// form values -> API body. `original` is the problem being edited, if any.
export function toPayload(values, original) {
  const reference = codeEntries(values.referenceByLang, original?.referenceSolution?.language, "completeCode");
  const starter = codeEntries(values.starterByLang, original?.starterCode?.language, "code");

  return {
    problemID: Number(values.problemID),
    title: values.title.trim(),
    description: values.description.trim(),
    difficulty: values.difficulty,
    tags: values.tags,
    constraints: values.constraints.split("\n").map((line) => line.trim()).filter(Boolean),
    timeLimit: Number(values.timeLimit),
    memoryLimit: Number(values.memoryLimit),
    visibleTestCases: values.visibleTestCases.map(({ input, output, explanation }) => ({ input, output, explanation })),
    hiddenTestCases: values.hiddenTestCases.map(({ input, output }) => ({ input, output })),
    referenceSolution: reference.single,
    referenceSolutions: reference.list,
    starterCode: starter.single,
    starterCodes: starter.list,
  };
}

// backend field path -> the form field that shows its error
export function toFieldName(path) {
  if (path.startsWith("referenceSolution")) return "referenceByLang";
  if (path.startsWith("starterCode")) return "starterByLang";
  if (path.startsWith("constraints")) return "constraints";
  if (path.startsWith("tags")) return "tags";
  return path;
}

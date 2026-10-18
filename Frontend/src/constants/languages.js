// Languages supported by the backend judge (must match LANGUAGE_ENUM in backend/src/utils/validateReqBody.js).
// `monaco` is the Monaco editor language id.
export const LANGUAGES = [
  { id: "cpp", label: "C++", monaco: "cpp" },
  { id: "java", label: "Java", monaco: "java" },
  { id: "python", label: "Python", monaco: "python" },
  { id: "javascript", label: "JavaScript", monaco: "javascript" },
  { id: "c", label: "C", monaco: "c" },
];

export const DEFAULT_LANGUAGE = "cpp";

// Used when a problem has no starter code for the chosen language.
// Every program reads the test case from stdin and prints the answer to stdout.
export const FALLBACK_TEMPLATES = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Read input from stdin and print the answer to stdout

    return 0;
}
`,
  java: `import java.util.*;

// Judge0 requires the class to be named Main
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Read input from stdin and print the answer to stdout

    }
}
`,
  python: `import sys

def main():
    data = sys.stdin.read().split()
    # Read input from stdin and print the answer to stdout

if __name__ == "__main__":
    main()
`,
  javascript: `const data = require("fs").readFileSync(0, "utf8").trim().split(/\\s+/);

// Read input from stdin and print the answer to stdout (console.log)
`,
  c: `#include <stdio.h>

int main() {
    // Read input from stdin and print the answer to stdout

    return 0;
}
`,
};

export function getLanguageLabel(id) {
  return LANGUAGES.find((l) => l.id === id)?.label ?? id;
}

// Problem's own starter code for a language, falling back to a generic template
export function getStarterCode(problem, language) {
  const fromList = problem?.starterCodes?.find((s) => s.language === language)?.code;
  if (fromList) return fromList;
  if (problem?.starterCode?.language === language) return problem.starterCode.code;
  return FALLBACK_TEMPLATES[language] ?? "";
}

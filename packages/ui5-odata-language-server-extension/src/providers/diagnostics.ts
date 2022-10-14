import { Diagnostic } from "vscode-languageserver";

export function getDiagnostics(): Diagnostic[] {
  try {
    return [
      {
        message: "testing diagnostic",
        range: {
          start: { line: 5, character: 25 },
          end: { line: 7, character: 15 },
        },
      },
    ];
  } catch (error) {
    console.log(`Diagnostics failed`, error);
    return [];
  }
}

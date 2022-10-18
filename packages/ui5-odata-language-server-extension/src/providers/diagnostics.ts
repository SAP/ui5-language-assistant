import { Diagnostic } from "vscode-languageserver";
import { ExtensionDiagnosticParams } from "@ui5-language-assistant/ui5-language-server-extension-types";

export async function getDiagnostics({
  documentPath,
  ast,
  ui5Model,
}: ExtensionDiagnosticParams): Promise<Diagnostic[]> {
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

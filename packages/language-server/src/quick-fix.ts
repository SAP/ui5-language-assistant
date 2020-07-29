import {
  Diagnostic,
  CodeAction,
  Command,
  CodeActionKind,
} from "vscode-languageserver";
import { find, isEqual } from "lodash";
import { Range, TextDocument } from "vscode-languageserver-types";

type docUri = string;
type extendedDiagnostic = Diagnostic & {
  quickFixIdSuggestion?: string;
  quickFixIdRange?: Range;
};
type DiagnosticData = Record<docUri, extendedDiagnostic[]>;
const diagnosticData: DiagnosticData = Object.create(null);

export function updateDiagnosticData(
  docUri: string,
  diagnostic: Diagnostic[]
): void {
  diagnosticData[docUri] = diagnostic;
}

export function getFullDiagnostic(
  docUri: string,
  diagnostic: Diagnostic
): extendedDiagnostic | undefined {
  return find(
    diagnosticData[docUri],
    (_) =>
      isEqual(_.range, diagnostic.range) && _.message === diagnostic.message
  );
}

export function getCodeActionForDiagnostic(
  docUri: string,
  diagnostic: Diagnostic
): CodeAction | undefined {
  switch (diagnostic.code) {
    case 666: {
      // non stable id
      return getCodeActionForQuickFixId(docUri, diagnostic);
    }
    default:
      return undefined;
  }
}

function getCodeActionForQuickFixId(
  docUri: string,
  nonStableIdDiagnostic: Diagnostic
): CodeAction | undefined {
  const fullDiagnostic = getFullDiagnostic(docUri, nonStableIdDiagnostic);

  if (fullDiagnostic === undefined) {
    return undefined;
  }

  const quickFixIDSuggestion = fullDiagnostic.quickFixIdSuggestion;
  const title = "QuickFix Stable ID";
  return CodeAction.create(
    title,
    Command.create(
      title,
      "stableIdQuickFix",
      docUri,
      fullDiagnostic.quickFixIdRange,
      quickFixIDSuggestion
    ),
    CodeActionKind.QuickFix
  );
}

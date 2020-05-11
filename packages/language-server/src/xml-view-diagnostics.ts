import { map } from "lodash";
import { assertNever } from "assert-never";
import {
  Diagnostic,
  DiagnosticSeverity,
  DiagnosticTag,
} from "vscode-languageserver-types";
import { TextDocument } from "vscode-languageserver-textdocument";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  UI5XMLViewIssue,
  validateXMLView,
  XMLViewIssueSeverity,
} from "@ui5-language-assistant/xml-views-validation";

export function getXMLViewDiagnostics(opts: {
  document: TextDocument;
  ui5Model: UI5SemanticModel;
}): Diagnostic[] {
  const documentText = opts.document.getText();
  const { cst, tokenVector } = parse(documentText);
  const xmlDocAst = buildAst(cst as DocumentCstNode, tokenVector);
  const issues = validateXMLView({
    xmlView: xmlDocAst,
    model: opts.ui5Model,
  });
  const diagnostics = validationIssuesToLspDiagnostics(issues, opts.document);
  return diagnostics;
}

function validationIssuesToLspDiagnostics(
  issues: UI5XMLViewIssue[],
  document: TextDocument
): Diagnostic[] {
  const diagnostics: Diagnostic[] = map(issues, (currIssue) => {
    const commonDiagnosticPros: Diagnostic = {
      range: {
        start: document.positionAt(currIssue.offsetRange.start),
        // Chevrotain's end offsets are none inclusive
        end: document.positionAt(currIssue.offsetRange.end + 1),
      },
      severity: toLspSeverity(currIssue.severity),
      source: "UI5 Language Assistant",
      message: currIssue.message,
    };

    const issueKind = currIssue.kind;
    switch (issueKind) {
      case "UseOfDeprecatedClass":
        return {
          ...commonDiagnosticPros,
          tags: [DiagnosticTag.Deprecated],
        };
      default:
        // Most issues don't need any special handling
        return {
          ...commonDiagnosticPros,
        };
    }
  });

  return diagnostics;
}

function toLspSeverity(
  issueSeverity: XMLViewIssueSeverity
): DiagnosticSeverity {
  switch (issueSeverity) {
    case "error":
      return DiagnosticSeverity.Error;
    case "warn":
      return DiagnosticSeverity.Warning;
    /* istanbul ignore next - no `Warning` validation yet */
    case "info":
      return DiagnosticSeverity.Information;
    /* istanbul ignore next - no `information` validation yet */
    case "hint":
      return DiagnosticSeverity.Hint;
    /* istanbul ignore next - defensive programming */
    default:
      assertNever(issueSeverity);
  }
}

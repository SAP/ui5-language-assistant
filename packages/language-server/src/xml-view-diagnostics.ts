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
import { convertDescriptionToMarkup } from "./documentation";

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
  const diagnostics = validationIssuesToLspDiagnostics({
    issues,
    document: opts.document,
    ui5Model: opts.ui5Model,
  });
  return diagnostics;
}

function validationIssuesToLspDiagnostics(opts: {
  issues: UI5XMLViewIssue[];
  document: TextDocument;
  ui5Model: UI5SemanticModel;
}): Diagnostic[] {
  const diagnostics: Diagnostic[] = map(opts.issues, (currIssue) => {
    const commonDiagnosticPros: Diagnostic = {
      range: {
        start: opts.document.positionAt(currIssue.offsetRange.start),
        // Chevrotain's end offsets are none inclusive
        end: opts.document.positionAt(currIssue.offsetRange.end + 1),
      },
      severity: toLspSeverity(currIssue.severity),
      source: "UI5 Language Assistant",
      message: convertDescriptionToMarkup(currIssue.message, opts.ui5Model)
        .value,
    };

    const issueKind = currIssue.kind;
    switch (issueKind) {
      case "UnknownEnumValue":
        return {
          ...commonDiagnosticPros,
        };
      case "UseOfDeprecatedClass":
        return {
          ...commonDiagnosticPros,
          tags: [DiagnosticTag.Deprecated],
        };
      /* istanbul ignore next - defensive programming */
      default:
        assertNever(issueKind);
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

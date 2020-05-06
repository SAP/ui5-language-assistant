/* istanbul ignore file - Shahar: Tests will be done in a separate PR (exploring snapshot tests) */
import { map, drop } from "lodash";
import { assertNever } from "assert-never";
import {
  Diagnostic,
  DiagnosticSeverity,
  DiagnosticTag
} from "vscode-languageserver-types";
import { TextDocument } from "vscode-languageserver-textdocument";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  UI5XMLViewIssue,
  validateXMLView,
  XMLViewIssueSeverity
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
    model: opts.ui5Model
  });
  const diagnostics = validationIssuesToLspDiagnostics(issues, opts.document);
  return diagnostics;
}

function validationIssuesToLspDiagnostics(
  issues: UI5XMLViewIssue[],
  document: TextDocument
): Diagnostic[] {
  const diagnostics: Diagnostic[] = map(issues, currIssue => {
    const commonDiagnosticPros: Diagnostic = {
      range: {
        start: document.positionAt(currIssue.offsetRanges[0].start),
        // Chevrotain's end offsets are none inclusive
        end: document.positionAt(currIssue.offsetRanges[0].end + 1)
      },
      severity: toLspSeverity(currIssue.severity),
      source: "UI5 Language Assistant",
      message: currIssue.message
    };

    // TODO: I think we should ditch the related issues for now, it does not work well for the only use case I can think of currently (deprecated on ending tag)
    if (hasRelatedIssues(currIssue)) {
      commonDiagnosticPros.relatedInformation = map(
        drop(currIssue.offsetRanges),
        _ => {
          return {
            message: currIssue.message,
            location: {
              uri: document.uri,
              range: {
                start: document.positionAt(_.start),
                end: document.positionAt(_.end + 1)
              }
            }
          };
        }
      );
    }

    const issueKind = currIssue.kind;
    switch (issueKind) {
      case "UnknownEnumValue":
        return {
          ...commonDiagnosticPros
        };
      case "UseOfDeprecatedClass":
        return {
          ...commonDiagnosticPros,
          tags: [DiagnosticTag.Deprecated]
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
    case "info":
      return DiagnosticSeverity.Information;
    case "hint":
      return DiagnosticSeverity.Hint;
    /* istanbul ignore next - defensive programming */
    default:
      assertNever(issueSeverity);
  }
}

function hasRelatedIssues(issue: UI5XMLViewIssue): boolean {
  return issue.offsetRanges.length > 1;
}

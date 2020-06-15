import { map } from "lodash";
import { assertNever } from "assert-never";
import {
  Diagnostic,
  DiagnosticSeverity,
  DiagnosticTag,
  Range as LSPRange,
} from "vscode-languageserver-types";
import { TextDocument } from "vscode-languageserver-textdocument";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  NonUniqueIDIssue,
  OffsetRange,
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
      range: offsetRangeToLSPRange(currIssue.offsetRange, document),
      severity: toLspSeverity(currIssue.severity),
      source: "UI5 Language Assistant",
      message: currIssue.message,
    };

    const issueKind = currIssue.kind;
    switch (issueKind) {
      case "InvalidBooleanValue":
      case "UnknownEnumValue":
      case "UnknownNamespaceInXmlnsAttributeValue":
      case "UnknownAttributeKey":
      case "UnknownTagName":
      case "InvalidAggregationCardinality":
      case "InvalidAggregationType":
        return {
          ...commonDiagnosticPros,
        };
      case "UseOfDeprecatedClass":
      case "UseOfDeprecatedProperty":
      case "UseOfDeprecatedEvent":
      case "UseOfDeprecatedAssociation":
      case "UseOfDeprecatedAggregation":
        return {
          ...commonDiagnosticPros,
          tags: [DiagnosticTag.Deprecated],
        };
      case "NonUniqueIDIssue":
        return {
          ...commonDiagnosticPros,
          relatedInformation: map(
            (currIssue as NonUniqueIDIssue).identicalIDsRanges,
            (_) => ({
              message: "identical ID also used here",
              location: {
                uri: document.uri,
                range: offsetRangeToLSPRange(_, document),
              },
            })
          ),
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

function offsetRangeToLSPRange(
  offsetRange: OffsetRange,
  document: TextDocument
): LSPRange {
  return {
    start: document.positionAt(offsetRange.start),
    // Chevrotain's end offsets are none inclusive
    end: document.positionAt(offsetRange.end + 1),
  };
}

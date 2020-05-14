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

    switch (currIssue.kind) {
      case "InvalidBooleanValue":
      case "UnknownEnumValue":
      case "UnknownNamespaceInXmlnsAttributeValue":
      case "UnknownAttributeKey":
      case "UnknownTagName":
      case "InvalidAggregationCardinality":
        return {
          ...commonDiagnosticPros,
        };
      case "UseOfDeprecatedClass":
        return {
          ...commonDiagnosticPros,
          tags: [DiagnosticTag.Deprecated],
        };
      case "NoneUniqueIDIssue":
        return {
          ...commonDiagnosticPros,
          relatedInformation: map(currIssue.identicalIDsRanges, (_) => ({
            // TODO: what message should be used in related issues?
            message: "also used here",
            location: {
              uri: document.uri,
              range: offsetRangeToLSPRange(_, document),
            },
          })),
        };
      /* istanbul ignore next - defensive programming */
      default:
        // We should use assertNever, However, TSC cannot seem to apply exhaustiveness checks
        // on inner properties (`currentIssue.kind`) nor does it seem to apply type guards correctly
        // when we first extract the kind (`const issueKind = currIssue.kind)... before the switch.
        throw Error("None Exhaustive Match");
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

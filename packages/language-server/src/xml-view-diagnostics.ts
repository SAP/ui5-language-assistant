import { map, cloneDeep } from "lodash";
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
import { validations } from "@ui5-language-assistant/end-user-strings";
import {
  NonUniqueIDIssue,
  UI5XMLViewIssue,
  validateXMLView,
  XMLViewIssueSeverity,
  defaultValidators,
  validators,
} from "@ui5-language-assistant/xml-views-validation";
import { offsetRangeToLSPRange } from "./range-utils";

export function getXMLViewDiagnostics(opts: {
  document: TextDocument;
  ui5Model: UI5SemanticModel;
  flexEnabled?: boolean;
}): Diagnostic[] {
  const documentText = opts.document.getText();
  const { cst, tokenVector } = parse(documentText);
  const xmlDocAst = buildAst(cst as DocumentCstNode, tokenVector);
  const actualValidators = cloneDeep(defaultValidators);
  if (opts.flexEnabled) {
    actualValidators.element.push(validators.validateNonStableId);
  }
  const issues = validateXMLView({
    validators: actualValidators,
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
      case "NonStableIDIssue":
        return {
          ...commonDiagnosticPros,
          code: validations.NON_STABLE_ID.code,
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

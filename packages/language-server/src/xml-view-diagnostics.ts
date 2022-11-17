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
import { AppContext } from "@ui5-language-assistant/semantic-model-types";
import {
  validations,
  DIAGNOSTIC_SOURCE,
} from "@ui5-language-assistant/user-facing-text";
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
  context: AppContext;
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
    context: opts.context,
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
      source: DIAGNOSTIC_SOURCE,
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
      case "InvalidAnnotationTarget":
      case "AnnotationTargetRequired":
      case "AnnotationPathRequired":
      case "InvalidAnnotationTerm":
      case "PathDoesNotExist":
      case "PropertyPathNotAllowed":
      case "PropertyPathRequired":
      case "UnknownAnnotationPath":
      case "UnknownPropertyPath":
      case "MissingEntitySet":
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
              message: validations.NON_UNIQUE_ID_RELATED_INFO.msg,
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

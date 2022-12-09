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
  UI5ValidatorsConfig,
  BaseUI5XMLViewIssue,
} from "@ui5-language-assistant/xml-views-validation";

import { defaultValidators as externalDefaultValidators } from "@ui5-language-assistant/fe";
import type { AnnotationIssue } from "@ui5-language-assistant/fe";
import { isAnnotationIssue } from "@ui5-language-assistant/fe";

import { offsetRangeToLSPRange } from "./range-utils";
import { Context } from "@ui5-language-assistant/context";

export function getXMLViewDiagnostics(opts: {
  document: TextDocument;
  context: Context;
}): Diagnostic[] {
  const documentText = opts.document.getText();
  const { cst, tokenVector } = parse(documentText);
  const xmlDocAst = buildAst(cst as DocumentCstNode, tokenVector);
  const actualValidators = cloneDeep(defaultValidators);
  if (opts.context.manifestDetails.flexEnabled) {
    actualValidators.element.push(validators.validateNonStableId);
  }
  const externalValidators: UI5ValidatorsConfig<AnnotationIssue> = cloneDeep(
    externalDefaultValidators
  );
  const issues = validateXMLView({
    validators: mergeValidators<AnnotationIssue>(
      actualValidators,
      externalValidators
    ),
    xmlView: xmlDocAst,
    context: opts.context,
  });
  const diagnostics = validationIssuesToLspDiagnostics(
    issues,
    opts.document,
    isAnnotationIssue
  );
  return diagnostics;
}

function mergeValidators<ExternalIssueType>(
  v1: UI5ValidatorsConfig<UI5XMLViewIssue>,
  v2: UI5ValidatorsConfig<ExternalIssueType>
): UI5ValidatorsConfig<UI5XMLViewIssue | ExternalIssueType> {
  return {
    attribute: [...v1.attribute, ...v2.attribute],
    document: [...v1.document, ...v2.document],
    element: [...v1.element, ...v2.element],
  };
}

function validationIssuesToLspDiagnostics<
  ExternalIssueType extends BaseUI5XMLViewIssue & {
    code?: string | number;
    tags?: DiagnosticTag[];
  }
>(
  issues: (UI5XMLViewIssue | ExternalIssueType)[],
  document: TextDocument,
  isExternalIssue: (
    issue: UI5XMLViewIssue | ExternalIssueType
  ) => issue is ExternalIssueType
): Diagnostic[] {
  const diagnostics: Diagnostic[] = map(issues, (currIssue) => {
    const commonDiagnosticPros: Diagnostic = {
      range: offsetRangeToLSPRange(currIssue.offsetRange, document),
      severity: toLspSeverity(currIssue.severity),
      source: DIAGNOSTIC_SOURCE,
      message: currIssue.message,
    };

    // external issue transformation
    if (isExternalIssue(currIssue)) {
      return {
        ...commonDiagnosticPros,
        code: currIssue.code,
        tags: currIssue.tags,
      };
    }

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

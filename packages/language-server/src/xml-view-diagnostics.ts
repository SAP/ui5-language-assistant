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

import { defaultValidators as feValidators } from "@ui5-language-assistant/fe";
import type { AnnotationIssue } from "@ui5-language-assistant/fe";
import { isAnnotationIssue } from "@ui5-language-assistant/fe";

import { offsetRangeToLSPRange } from "./range-utils";
import { Context } from "@ui5-language-assistant/context";
import {
  bindingValidators,
  isBindingIssue,
} from "@ui5-language-assistant/binding";
import type { BindingIssue } from "@ui5-language-assistant/binding";
import type { IssueType, ExternalIssueType } from "./types";

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
  const externalFeValidators: UI5ValidatorsConfig<AnnotationIssue> =
    cloneDeep(feValidators);
  const externalBindingValidators: UI5ValidatorsConfig<BindingIssue> =
    cloneDeep(bindingValidators);
  const issues = validateXMLView({
    validators: mergeValidators([
      actualValidators,
      externalFeValidators,
      externalBindingValidators,
    ]),
    xmlView: xmlDocAst,
    context: opts.context,
  });
  const diagnostics = validationIssuesToLspDiagnostics<IssueType>(
    issues,
    opts.document,
    [isAnnotationIssue, isBindingIssue]
  );
  return diagnostics;
}

function mergeValidators(
  param: [
    UI5ValidatorsConfig<UI5XMLViewIssue>,
    UI5ValidatorsConfig<AnnotationIssue>,
    UI5ValidatorsConfig<BindingIssue>
  ]
): UI5ValidatorsConfig<IssueType> {
  return param.reduce(
    (accumulator: UI5ValidatorsConfig<IssueType>, currentValue) => {
      return {
        attribute: [...accumulator.attribute, ...currentValue.attribute],
        document: [...accumulator.document, ...currentValue.document],
        element: [...accumulator.element, ...currentValue.element],
      };
    },
    {
      attribute: [],
      document: [],
      element: [],
    }
  );
}

function validationIssuesToLspDiagnostics<T extends ExternalIssueType>(
  issues: (UI5XMLViewIssue | T)[],
  document: TextDocument,
  externalIssues: ((issue: UI5XMLViewIssue | T) => issue is T)[]
): Diagnostic[] {
  const diagnostics: Diagnostic[] = map(issues, (currIssue) => {
    const range = isBindingIssue(currIssue)
      ? currIssue.range!
      : offsetRangeToLSPRange(currIssue.offsetRange, document);
    const commonDiagnosticPros: Diagnostic = {
      range,
      severity: toLspSeverity(currIssue.severity),
      source: DIAGNOSTIC_SOURCE,
      message: currIssue.message,
    };

    // external issue transformation
    for (const isExternalIssue of externalIssues) {
      if (isExternalIssue(currIssue)) {
        return {
          ...commonDiagnosticPros,
          code: currIssue.code,
          tags: currIssue.tags,
        };
      }
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
        assertNever(issueKind as never);
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

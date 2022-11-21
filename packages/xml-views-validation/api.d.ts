import { XMLDocument, XMLElement, XMLAttribute } from "@xml-tools/ast";
import { AppContext } from "@ui5-language-assistant/semantic-model-types";
import { OffsetRange } from "@ui5-language-assistant/logic-utils";
import { UI5ValidatorsConfig } from "./src/validate-xml-views";

export function validateXMLView(opts: {
  validators: UI5ValidatorsConfig;
  context: AppContext;
  xmlView: XMLDocument;
}): UI5XMLViewIssue[];

export declare const defaultValidators: UI5ValidatorsConfig;

export type XMLViewIssueSeverity = "hint" | "info" | "warn" | "error";

export interface BaseUI5XMLViewIssue {
  kind: string;
  message: string;
  severity: XMLViewIssueSeverity;
  offsetRange: OffsetRange;
}

export type UseOfDeprecatedAttributeIssue =
  | UseOfDeprecatedPropertyIssue
  | UseOfDeprecatedAggregationIssue
  | UseOfDeprecatedEventIssue
  | UseOfDeprecatedAssociationIssue;

export type AnnotationIssue =
  | UnknownAnnotationPathIssue
  | AnnotationTargetRequiredIssue
  | AnnotationPathRequiredIssue
  | PathDoesNotExistIssue
  | InvalidAnnotationTargetIssue
  | InvalidAnnotationTermIssue
  | PropertyPathNotAllowedIssue
  | PropertyPathRequiredIssue
  | UnknownPropertyPathIssue
  | IncompletePathIssue
  | MissingEntitySetIssue;

export type UI5XMLViewIssue =
  | UnknownEnumValueIssue
  | UseOfDeprecatedClassIssue
  | UseOfDeprecatedAggregationIssue
  | UseOfDeprecatedPropertyIssue
  | UseOfDeprecatedEventIssue
  | UseOfDeprecatedAssociationIssue
  | UnknownNamespaceInXmlnsAttributeValueIssue
  | InvalidBooleanValueIssue
  | NonUniqueIDIssue
  | NonStableIDIssue
  | UnknownAttributeKeyIssue
  | UnknownTagNameIssue
  | InvalidAggregationCardinalityIssue
  | InvalidAggregationTypeIssue
  | AnnotationIssue;

// A sub-interface per issue type may seem redundant, but this allows
// a sub-issue type to have additional properties (if needed) in the future.
export interface UnknownEnumValueIssue extends BaseUI5XMLViewIssue {
  kind: "UnknownEnumValue";
}

export interface UseOfDeprecatedClassIssue extends BaseUI5XMLViewIssue {
  kind: "UseOfDeprecatedClass";
}

export interface UseOfDeprecatedAggregationIssue extends BaseUI5XMLViewIssue {
  kind: "UseOfDeprecatedAggregation";
}

export interface UseOfDeprecatedPropertyIssue extends BaseUI5XMLViewIssue {
  kind: "UseOfDeprecatedProperty";
}

export interface UseOfDeprecatedEventIssue extends BaseUI5XMLViewIssue {
  kind: "UseOfDeprecatedEvent";
}

export interface UseOfDeprecatedAssociationIssue extends BaseUI5XMLViewIssue {
  kind: "UseOfDeprecatedAssociation";
}

export interface InvalidAggregationCardinalityIssue
  extends BaseUI5XMLViewIssue {
  kind: "InvalidAggregationCardinality";
}

export interface InvalidAggregationTypeIssue extends BaseUI5XMLViewIssue {
  kind: "InvalidAggregationType";
}

export interface UnknownNamespaceInXmlnsAttributeValueIssue
  extends BaseUI5XMLViewIssue {
  kind: "UnknownNamespaceInXmlnsAttributeValue";
}

export interface UnknownAttributeKeyIssue extends BaseUI5XMLViewIssue {
  kind: "UnknownAttributeKey";
}

export interface UnknownTagNameIssue extends BaseUI5XMLViewIssue {
  kind: "UnknownTagName";
}

export interface InvalidBooleanValueIssue extends BaseUI5XMLViewIssue {
  kind: "InvalidBooleanValue";
}

export interface NonUniqueIDIssue extends BaseUI5XMLViewIssue {
  kind: "NonUniqueIDIssue";
  identicalIDsRanges: OffsetRange[];
}

export interface NonStableIDIssue extends BaseUI5XMLViewIssue {
  kind: "NonStableIDIssue";
}

export interface AnnotationTargetRequiredIssue extends BaseUI5XMLViewIssue {
  kind: "AnnotationTargetRequired";
}

export interface InvalidAnnotationTargetIssue extends BaseUI5XMLViewIssue {
  kind: "InvalidAnnotationTarget";
}

export interface UnknownAnnotationPathIssue extends BaseUI5XMLViewIssue {
  kind: "UnknownAnnotationPath";
}

export interface AnnotationPathRequiredIssue extends BaseUI5XMLViewIssue {
  kind: "AnnotationPathRequired";
}

export interface PropertyPathRequiredIssue extends BaseUI5XMLViewIssue {
  kind: "PropertyPathRequired";
}

export interface PathDoesNotExistIssue extends BaseUI5XMLViewIssue {
  kind: "PathDoesNotExist";
}

export interface InvalidAnnotationTermIssue extends BaseUI5XMLViewIssue {
  kind: "InvalidAnnotationTerm";
}

export interface UnknownPropertyPathIssue extends BaseUI5XMLViewIssue {
  kind: "UnknownPropertyPath";
}

export interface PropertyPathNotAllowedIssue extends BaseUI5XMLViewIssue {
  kind: "PropertyPathNotAllowed";
}

export interface IncompletePathIssue extends BaseUI5XMLViewIssue {
  kind: "IncompletePath";
}

export interface MissingEntitySetIssue extends BaseUI5XMLViewIssue {
  kind: "MissingEntitySet";
}

type XMLAttributeValidator<T> = (
  attribute: XMLAttribute,
  context: AppContext
) => T[];

type XMLDocumentValidator<T> = (document: XMLDocument) => T[];

type XMLElementValidator<T> = (
  XMLElement: XMLElement,
  context: AppContext
) => T[];

type Validators = {
  validateUnknownEnumValue: XMLAttributeValidator<UnknownEnumValueIssue>;
  validateUnknownXmlnsNamespace: XMLAttributeValidator<UnknownNamespaceInXmlnsAttributeValueIssue>;
  validateBooleanValue: XMLAttributeValidator<InvalidBooleanValueIssue>;
  validateUseOfDeprecatedAttribute: XMLAttributeValidator<UseOfDeprecatedAttributeIssue>;
  validateUnknownAttributeKey: XMLAttributeValidator<UnknownAttributeKeyIssue>;
  validateNonUniqueID: XMLDocumentValidator<NonUniqueIDIssue>;
  validateUseOfDeprecatedAggregation: XMLElementValidator<UseOfDeprecatedAggregationIssue>;
  validateUseOfDeprecatedClass: XMLElementValidator<UseOfDeprecatedClassIssue>;
  validateUnknownTagName: XMLElementValidator<UnknownTagNameIssue>;
  validateExplicitAggregationCardinality: XMLElementValidator<InvalidAggregationCardinalityIssue>;
  validateAggregationType: XMLElementValidator<InvalidAggregationTypeIssue>;
  validateNonStableId: XMLElementValidator<NonStableIDIssue>;
};

export const validators: Validators;

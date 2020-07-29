import { XMLDocument } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";

export function validateXMLView(opts: {
  model: UI5SemanticModel;
  xmlView: XMLDocument;
  flexEnabled?: boolean;
}): UI5XMLViewIssue[];

export type XMLViewIssueSeverity = "hint" | "info" | "warn" | "error";

export interface BaseUI5XMLViewIssue {
  kind: string;
  message: string;
  severity: "hint" | "info" | "warn" | "error";
  offsetRange: OffsetRange;
  quickFixIdSuggestion?: string;
  quickFixIdRange?: OffsetRange;
}

export interface OffsetRange {
  start: number;
  end: number;
}

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
  | InvalidAggregationTypeIssue;

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
  quickFixIdSuggestion: string;
  quickFixIdRange: OffsetRange;
}

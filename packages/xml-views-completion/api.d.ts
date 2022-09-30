import {
  XMLAttribute,
  XMLElement,
  XMLDocument,
  XMLAstNode,
} from "@xml-tools/ast";
import { DocumentCstNode } from "@xml-tools/parser";
import { IToken } from "chevrotain";
import {
  UI5Aggregation,
  UI5Class,
  UI5Event,
  UI5Namespace,
  UI5Prop,
  UI5Association,
  UI5EnumValue,
  AppContext,
  ServiceDetails,
} from "@ui5-language-assistant/semantic-model-types/api";
import { CodeAssistSettings } from "@ui5-language-assistant/settings";
import { AnnotationTerm } from "@ui5-language-assistant/logic-utils/src/api";
import { ConvertedMetadata, EntityType } from "@sap-ux/vocabularies-types";

export function getXMLViewCompletions(
  opts: GetXMLViewCompletionsOpts
): UI5XMLViewCompletion[];

export interface GetXMLViewCompletionsOpts {
  context: AppContext;
  offset: number;
  cst: DocumentCstNode;
  ast: XMLDocument;
  tokenVector: IToken[];
  settings: CodeAssistSettings;
}

export type UI5CompletionNode =
  | UI5Namespace
  | UI5Class
  | UI5Aggregation
  | UI5Event
  | UI5Prop
  | UI5Association
  | UI5EnumValue
  | BooleanValue
  | AnnotationPathValue
  | AnnotationTargetValue;

export type UI5XMLViewCompletion =
  | UI5NodeXMLViewCompletion
  | AnnotationPathInXMLAttributeValueCompletion
  | AnnotationTargetInXMLAttributeValueCompletion
  | BooleanValueInXMLAttributeValueCompletion
  | PropertyPathInXMLAttributeValueCompletion;

export type UI5NodeXMLViewCompletion =
  | UI5ClassesInXMLTagNameCompletion
  | UI5AggregationsInXMLTagNameCompletion
  | UI5EnumsInXMLAttributeValueCompletion
  | UI5PropsInXMLAttributeKeyCompletion
  | UI5EventsInXMLAttributeKeyCompletion
  | UI5AssociationsInXMLAttributeKeyCompletion
  | UI5NamespacesInXMLAttributeKeyCompletion
  | UI5NamespacesInXMLAttributeValueCompletion;

export type UI5XMLViewCompletionTypeName =
  | "UI5ClassesInXMLTagName"
  | "UI5AggregationsInXMLTagName"
  | "UI5EnumsInXMLAttributeValue"
  | "UI5PropsInXMLAttributeKey"
  | "UI5EventsInXMLAttributeKey"
  | "UI5AssociationsInXMLAttributeKey"
  | "UI5NamespacesInXMLAttributeKey"
  | "UI5NamespacesInXMLAttributeValue"
  | "BooleanValueInXMLAttributeValue"
  | "AnnotationPathInXMLAttributeValue"
  | "PropertyPathInXMLAttributeValue"
  | "AnnotationTargetInXMLAttributeValue";

/**
 * Note that this interface does not deal with "Editor Behavior". e.g:
 * - The Text to insert may differ from the label.
 * - Additional text insertions may be needed:
 *   - Align open and close tags.
 *   - Add '>' to close a tag.
 *   - Add quotes to wrap an attribute's value.
 *
 * Rather it should  contain the completion "pure" data.
 */
export interface BaseXMLViewCompletion<
  XML extends XMLAstNode,
  UI5 extends UI5CompletionNode
> {
  type: UI5XMLViewCompletionTypeName;
  // The Node we want to suggest as a possible completion.
  // Note this carries all the additional semantic data (deprecated/description/...).
  ui5Node: UI5;

  // The specific ASTNode where the completion happened
  // may be useful for LSP Layer to implement Editor Level Logic.
  //   - e.g: the "additional text insertions" mentioned above.
  astNode: XML;
}

export interface UI5ClassesInXMLTagNameCompletion
  extends BaseXMLViewCompletion<XMLElement, UI5Class> {
  type: "UI5ClassesInXMLTagName";
}

export interface UI5AggregationsInXMLTagNameCompletion
  extends BaseXMLViewCompletion<XMLElement, UI5Aggregation> {
  type: "UI5AggregationsInXMLTagName";
}

export interface UI5EnumsInXMLAttributeValueCompletion
  extends BaseXMLViewCompletion<XMLAttribute, UI5EnumValue> {
  type: "UI5EnumsInXMLAttributeValue";
}

export interface UI5PropsInXMLAttributeKeyCompletion
  extends BaseXMLViewCompletion<XMLAttribute, UI5Prop> {
  type: "UI5PropsInXMLAttributeKey";
}

export interface UI5EventsInXMLAttributeKeyCompletion
  extends BaseXMLViewCompletion<XMLAttribute, UI5Event> {
  type: "UI5EventsInXMLAttributeKey";
}

export interface UI5AssociationsInXMLAttributeKeyCompletion
  extends BaseXMLViewCompletion<XMLAttribute, UI5Association> {
  type: "UI5AssociationsInXMLAttributeKey";
}

export interface UI5NamespacesInXMLAttributeKeyCompletion
  extends BaseXMLViewCompletion<XMLAttribute, UI5Namespace> {
  type: "UI5NamespacesInXMLAttributeKey";
}

export interface UI5NamespacesInXMLAttributeValueCompletion
  extends BaseXMLViewCompletion<XMLAttribute, UI5Namespace> {
  type: "UI5NamespacesInXMLAttributeValue";
}

export interface BooleanValue {
  kind: "BooleanValue";
  // The name of the suggestion
  name: string;
  // The literal value that we want to suggest as a possible completion
  value: boolean;
}

export interface BooleanValueInXMLAttributeValueCompletion
  extends BaseXMLViewCompletion<XMLAttribute, BooleanValue> {
  type: "BooleanValueInXMLAttributeValue";
}

export interface AnnotationPathValue {
  kind: "AnnotationPath";
  name: string;
  value: string;
}

export interface AnnotationTargetValue {
  kind: "AnnotationTarget";
  name: string;
  value: string;
}

export interface AnnotationPathCompletionDetails {
  startString: string;
  remainingString: string;
  commitCharacters: string[];
}

export interface AnnotationPathInXMLAttributeValueCompletion
  extends BaseXMLViewCompletion<XMLAttribute, AnnotationPathValue> {
  type: "AnnotationPathInXMLAttributeValue";
  details?: AnnotationPathCompletionDetails;
}

export interface PropertyPathInXMLAttributeValueCompletion
  extends BaseXMLViewCompletion<XMLAttribute, AnnotationPathValue> {
  type: "PropertyPathInXMLAttributeValue";
  details?: AnnotationPathCompletionDetails;
}

export interface AnnotationTargetInXMLAttributeValueCompletion
  extends BaseXMLViewCompletion<XMLAttribute, AnnotationTargetValue> {
  type: "AnnotationTargetInXMLAttributeValue";
}

/** Check if the suggestion is a UI5 semantic model xml completion according to its type property */
export function isUI5NodeXMLViewCompletion(
  suggestion: UI5XMLViewCompletion
): suggestion is UI5NodeXMLViewCompletion;

export function getNavigationTargets(
  service: ServiceDetails,
  options: {
    allowedTerms: AnnotationTerm[];
    isCollection?: boolean;
    isPropertyPath?: boolean;
    includeProperties?: boolean;
    relativeFor?: EntityType;
  }
): string[];
export function isPropertyPathAllowed(control: string): boolean;
export function collectAnnotationsForType(
  convertedMetadata: ConvertedMetadata,
  entityType: string | EntityType,
  allowedTerms: AnnotationTerm[],
  property?: string,
  navigationProperty?: string
): any[];

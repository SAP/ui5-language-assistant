import {
  XMLAttribute,
  XMLElement,
  XMLDocument,
  XMLAstNode
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
  UI5SemanticModel,
  UI5EnumValue,
  PrimitiveType
} from "@ui5-language-assistant/semantic-model-types/api";

export function getXMLViewCompletions(
  opts: GetXMLViewCompletionsOpts
): UI5XMLViewCompletion[];

export interface GetXMLViewCompletionsOpts {
  model: UI5SemanticModel;
  offset: number;
  cst: DocumentCstNode;
  ast: XMLDocument;
  tokenVector: IToken[];
}

export type UI5CompletionNode =
  | UI5Namespace
  | UI5Class
  | UI5Aggregation
  | UI5Event
  | UI5Prop
  | UI5Association
  | UI5EnumValue;

export type UI5XMLViewCompletion =
  | UI5NodeXMLViewCompletion
  | LiteralXMLViewCompletion;

export type UI5NodeXMLViewCompletion =
  | UI5ClassesInXMLTagNameCompletion
  | UI5AggregationsInXMLTagNameCompletion
  | UI5EnumsInXMLAttributeValueCompletion
  | UI5PropsInXMLAttributeKeyCompletion
  | UI5EventsInXMLAttributeKeyCompletion
  | UI5AssociationsInXMLAttributeKeyCompletion
  | UI5NamespacesInXMLAttributeKeyCompletion
  | UI5NamespacesInXMLAttributeValueCompletion;

export type UI5NodeNodeXMLViewCompletionTypeName =
  | "UI5ClassesInXMLTagName"
  | "UI5AggregationsInXMLTagName"
  | "UI5EnumsInXMLAttributeValue"
  | "UI5PropsInXMLAttributeKey"
  | "UI5EventsInXMLAttributeKey"
  | "UI5AssociationsInXMLAttributeKey"
  | "UI5NamespacesInXMLAttributeKey"
  | "UI5NamespacesInXMLAttributeValue";

export type LiteralXMLViewCompletionTypeName = "BooleanValueInXMLAttributeValueCompletion";

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
  type: UI5NodeNodeXMLViewCompletionTypeName;
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

export type LiteralXMLViewCompletionBaseType = boolean | string | number;
export interface BaseLiteralXMLViewCompletion<
  XML extends XMLAstNode,
  Primitive extends PrimitiveType,
  // This type must correspond to Primitive and have a string representation
  LiteralXMLViewCompletionBaseType
> {
  type: LiteralXMLViewCompletionTypeName;
  // The name of the suggestion
  name: string;
  // The primitive type of the we want to suggest as a possible completion.
  primitiveType: Primitive;
  // The literal value that we want to suggest as a possible completion.
  value: LiteralXMLViewCompletionBaseType;

  // The specific ASTNode where the completion happened
  // may be useful for LSP Layer to implement Editor Level Logic.
  //   - e.g: the "additional text insertions" mentioned above.
  astNode: XML;
}

export type LiteralXMLViewCompletion = BooleanValueInXMLAttributeValueCompletion;

export interface BooleanValueInXMLAttributeValueCompletion
  extends BaseLiteralXMLViewCompletion<XMLAttribute, PrimitiveType, boolean> {
  type: "BooleanValueInXMLAttributeValueCompletion";
}

export function isLiteralXMLViewCompletion(
  suggestion: UI5XMLViewCompletion
): suggestion is LiteralXMLViewCompletion;
export function isUI5NodeXMLViewCompletion(
  suggestion: UI5XMLViewCompletion
): suggestion is UI5NodeXMLViewCompletion;

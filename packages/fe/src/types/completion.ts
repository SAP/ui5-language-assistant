import { MarkupContent, Range } from "vscode-languageserver";

// export enum CompletionItemKind {
//   Term = 'Term',
//   EntityContainer = 'EntityContainer',
//   EntitySet = 'EntitySet',
//   EntityType = 'EntityType',
//   NavigationProperty = 'NavigationProperty',
//   ComplexType = 'ComplexType',
//   Property = 'Property',
//   Unknown = 'Unknown'
// }

export type CompletionItemKind =
  | "Term"
  | "EntityContainer"
  | "EntitySet"
  | "Singleton"
  | "EntityType"
  | "NavigationProperty"
  | "ComplexType"
  | "Property"
  | "FilterBarId"
  | "Unknown";

export interface BaseCompletionItem {
  kind: CompletionItemKind;
  name: string; // used to eliminate duplicates (in simple cases: the completed string)
  text: string; // text to be applied (via insert or replace)
  affectedRange?: Range; // in replace mode: range to be replaced (if replace or not will be decided centrally)
  //category?: CompletionItemCategory; // enum member for possible categories; will be mapped to LSP kind centrally
  id?: string; // together with category: provide basis for generation of documentation
  commitCharacters?: string[];
  commitCharacterRequired?: boolean; // item only valid if followed by one of the commit characters
  documentation?: string | MarkupContent;
  deprecated?: boolean;
  detail?: string;
  sortText?: string;
  insertText?: string;
  filterText?: string;
}

export type UI5XMLViewAnnotationCompletionType =
  | "AnnotationPathInXMLAttributeValue"
  | "PropertyPathInXMLAttributeValue"
  | "AnnotationTargetInXMLAttributeValue"
  | "FilterBarIdInXMLAttributeValue";

export type UI5XMLViewAnnotationCompletion =
  | AnnotationTargetInXMLAttributeValueCompletion
  | AnnotationPathInXMLAttributeValueCompletion
  | PropertyPathInXMLAttributeValueCompletion
  | FilterBarIdInXMLAttributeValueCompletion;

export type AnnotationTargetValueCompletionItem =
  | EntityContainerCompletionItem
  | EntitySetCompletionItem
  | EntityTypeCompletionItem
  | SingletonCompletionItem
  | NavigationPropertyCompletionItem;
export type AnnotationPathValueCompletionItem =
  | NavigationPropertyCompletionItem
  | TermCompletionItem;
export type PropertyPathValueCompletionItem =
  | NavigationPropertyCompletionItem
  | PropertyCompletionItem;

export interface BaseXMLViewAnnotationCompletion<T> {
  type: UI5XMLViewAnnotationCompletionType;
  node: T;
}

export interface EntityContainerCompletionItem extends BaseCompletionItem {
  kind: "EntityContainer";
}

export interface EntityTypeCompletionItem extends BaseCompletionItem {
  kind: "EntityType";
}

export interface EntitySetCompletionItem extends BaseCompletionItem {
  kind: "EntitySet";
}

export interface SingletonCompletionItem extends BaseCompletionItem {
  kind: "Singleton";
}

export interface NavigationPropertyCompletionItem extends BaseCompletionItem {
  kind: "NavigationProperty";
}

export interface PropertyCompletionItem extends BaseCompletionItem {
  kind: "Property";
}

export interface TermCompletionItem extends BaseCompletionItem {
  kind: "Term";
}

export interface FilterBarIdValue extends BaseCompletionItem {
  kind: "FilterBarId";
}

export interface AnnotationPathCompletionDetails {
  startString: string;
  remainingString: string;
  commitCharacters: string[];
}

export interface AnnotationPathInXMLAttributeValueCompletion
  extends BaseXMLViewAnnotationCompletion<AnnotationPathValueCompletionItem> {
  type: "AnnotationPathInXMLAttributeValue";
}

export interface PropertyPathInXMLAttributeValueCompletion
  extends BaseXMLViewAnnotationCompletion<PropertyPathValueCompletionItem> {
  type: "PropertyPathInXMLAttributeValue";
}

export interface AnnotationTargetInXMLAttributeValueCompletion
  extends BaseXMLViewAnnotationCompletion<AnnotationTargetValueCompletionItem> {
  type: "AnnotationTargetInXMLAttributeValue";
}

export interface FilterBarIdInXMLAttributeValueCompletion
  extends BaseXMLViewAnnotationCompletion<FilterBarIdValue> {
  type: "FilterBarIdInXMLAttributeValue";
}

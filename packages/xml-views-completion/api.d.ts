import { XMLAttribute, XMLElement, XMLDocument } from "@xml-tools/ast";
import { DocumentCstNode } from "@xml-tools/parser";
import { IToken } from "chevrotain";
import {
  UI5Aggregation,
  UI5Class,
  UI5Event,
  UI5Namespace,
  UI5Prop,
  UI5SemanticModel,
  UI5EnumValue
} from "@ui5-editor-tools/semantic-model-types";

export function getXMLViewCompletions(
  opts: GetXMLViewCompletionsOpts
): XMLViewCompletion[];

export interface GetXMLViewCompletionsOpts {
  model: UI5SemanticModel;
  offset: number;
  cst: DocumentCstNode;
  ast: XMLDocument;
  tokenVector: IToken[];
}

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
export interface XMLViewCompletion {
  // The Node we want to suggest as a possible completion.
  // Note this carries all the additional semantic data (deprecated/description/...).
  ui5Node:
    | UI5Class
    | UI5Aggregation
    | UI5Prop
    | UI5Event
    | UI5EnumValue
    | UI5Namespace;
  // The specific ASTNode where the completion happened
  // may be useful for LSP Layer to implement Editor Level Logic.
  //   - e.g: the "additional text insertions" mentioned above.
  // TODO: is it always the same ASTNode for all the suggestions?
  //  - are we holding duplicate the references here?
  astNode: XMLElement | XMLAttribute;
}

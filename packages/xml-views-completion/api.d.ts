import { XMLAstNode } from "@xml-tools/ast";
import { CstNode, IToken } from "chevrotain";

export function getXMLViewCompletions(opts: {
  offset: number;
  cst: CstNode;
  ast: XMLDocument;
  tokenVector: IToken[];
}): XMLViewCompletion[];

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
  label: string;
  kind: XMLViewCompletionKind;
  documentation?: string;
  since?: string;
  deprecated?: boolean;
  // The specific ASTNode where the completion happened
  // may be useful for LSP Layer to implement Editor Level Logic.
  ast: XMLAstNode;
}

// TODO: Fill this up as we implement more completion logic
export type XMLViewCompletionKind = "Class" | "Aggregation" | "Property";

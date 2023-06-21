import { CompletionItem } from "vscode-languageserver-types";
import { TextDocumentPositionParams } from "vscode-languageserver-protocol";
import { CstNode, IToken } from "chevrotain";
import { DocumentCstNode } from "@xml-tools/parser";
import { XMLDocument } from "@xml-tools/ast";
import { Settings } from "@ui5-language-assistant/settings";
import { getSuggestions } from "@xml-tools/content-assist";
import { Context } from "@ui5-language-assistant/context";
import { TextDocument } from "vscode-languageserver-textdocument";

import { attributeValueProviders } from "./providers";
import { BindContext } from "../../types";
import { getLogger } from "../../utils";

export function getCompletionItems(opts: {
  context: Context;
  textDocumentPosition: TextDocumentPositionParams;
  document: TextDocument;
  documentSettings: Settings;
  cst: CstNode;
  tokenVector: IToken[];
  ast: XMLDocument;
}): CompletionItem[] {
  try {
    const context: BindContext = {
      ...opts.context,
      textDocumentPosition: opts.textDocumentPosition,
    };
    const suggestions = getSuggestions<CompletionItem, BindContext>({
      offset: opts.document.offsetAt(opts.textDocumentPosition.position),
      cst: opts.cst as DocumentCstNode,
      ast: opts.ast,
      tokenVector: opts.tokenVector,
      context,
      providers: {
        elementContent: [],
        elementName: [],
        attributeName: [],
        attributeValue: attributeValueProviders,
      },
    });
    getLogger().trace("computed completion items", {
      suggestions,
    });
    return suggestions;
  } catch (error) {
    getLogger().debug("getCompletionItems failed:", error);
    return [];
  }
}

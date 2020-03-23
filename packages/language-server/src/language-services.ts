import { map } from "lodash";
import {
  CompletionItem,
  CompletionItemKind,
  CompletionItemTag,
  TextDocumentPositionParams
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-editor-tools/semantic-model-types";
import {
  getXMLViewCompletions,
  UI5XMLViewCompletion
} from "@ui5-editor-tools/xml-views-completion";

export function getCompletionItems(
  model: UI5SemanticModel,
  textDocumentPosition: TextDocumentPositionParams,
  document: TextDocument
): CompletionItem[] {
  const documentText = document.getText() ?? "";
  const { cst, tokenVector } = parse(documentText);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  const suggestions = getXMLViewCompletions({
    model: model,
    offset: document.offsetAt(textDocumentPosition.position),
    cst: cst as DocumentCstNode,
    ast: ast,
    tokenVector: tokenVector
  });

  return transformToLspSuggestions(suggestions);
}

function transformToLspSuggestions(
  suggestions: UI5XMLViewCompletion[]
): CompletionItem[] {
  const lspSuggestions = map(suggestions, suggestion => {
    const lspKind = computeLSPKind(suggestion);
    const completionItem: CompletionItem = {
      label: suggestion.ui5Node.name,
      detail: suggestion.ui5Node.description,
      kind: lspKind,
      tags: suggestion.ui5Node.deprecatedInfo
        ? [CompletionItemTag.Deprecated]
        : undefined
    };
    // transformation
    return completionItem;
  });
  return lspSuggestions;
}

export function computeLSPKind(
  suggestion: UI5XMLViewCompletion
): CompletionItemKind {
  switch (suggestion.type) {
    case "UI5NamespacesInXMLAttributeKey":
    case "UI5NamespacesInXMLAttributeValue":
      return CompletionItemKind.Text;
    case "UI5PropsInXMLAttributeKey":
      return CompletionItemKind.Property;
    case "UI5ClassesInXMLTagName":
      return CompletionItemKind.Class;
    case "UI5EventsInXMLAttributeKey":
      return CompletionItemKind.Event;
    case "UI5AggregationsInXMLTagName":
      return CompletionItemKind.Text;
    case "UI5EnumsInXMLAttributeValue":
      return CompletionItemKind.EnumMember;
    default:
      // TODO: we probably need a logging solution to highlight edge cases we
      //       do not handle...
      return CompletionItemKind.Text;
  }
}

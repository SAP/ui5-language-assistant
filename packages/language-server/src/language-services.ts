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
  XMLViewCompletion,
  getXMLViewCompletions
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
  suggestions: XMLViewCompletion[]
): CompletionItem[] {
  const lspSuggestions = map(suggestions, suggestion => {
    const lspkind = computeLSPKind(suggestion);
    const completionItem: CompletionItem = {
      label: suggestion.ui5Node.name,
      detail: suggestion.ui5Node.description,
      kind: lspkind,
      tags: suggestion.ui5Node.deprecatedInfo
        ? [CompletionItemTag.Deprecated]
        : undefined
    };
    return completionItem;
  });
  return lspSuggestions;
}

export function computeLSPKind(
  suggestion: XMLViewCompletion
): CompletionItemKind {
  switch (suggestion.ui5Node.kind) {
    case "UI5Namespace":
      return CompletionItemKind.Text;
    case "UI5Prop":
      return CompletionItemKind.Property;
    case "UI5Class":
      return CompletionItemKind.Class;
    case "UI5Event":
      return CompletionItemKind.Event;
    case "UI5Aggregation":
      return CompletionItemKind.Text;
    case "UI5EnumValue":
      return CompletionItemKind.EnumMember;
    default:
      return CompletionItemKind.Text;
  }
}

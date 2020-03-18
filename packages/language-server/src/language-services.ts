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
  return map(suggestions, suggestion => {
    return getCompetionItem(suggestion);
  });
}

export function getCompetionItem(
  suggestion: XMLViewCompletion
): CompletionItem {
  const completionItem: CompletionItem = {
    label: suggestion.ui5Node.name,
    detail: suggestion.ui5Node.description,
    tags: suggestion.ui5Node.deprecatedInfo
      ? [CompletionItemTag.Deprecated]
      : undefined
  };
  switch (suggestion.ui5Node.kind) {
    case "UI5Namespace":
      completionItem.kind = CompletionItemKind.Text;
      break;
    case "UI5Prop":
      completionItem.kind = CompletionItemKind.Property;
      break;
    case "UI5Class":
      completionItem.kind = CompletionItemKind.Class;
      break;
    case "UI5Event":
      completionItem.kind = CompletionItemKind.Event;
      break;
    case "UI5Aggregation":
      completionItem.kind = CompletionItemKind.Text;
      break;
    case "UI5EnumValue":
      completionItem.kind = CompletionItemKind.EnumMember;
      break;
    default:
      completionItem.kind = CompletionItemKind.Text;
  }
  return completionItem;
}

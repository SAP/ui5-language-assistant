import { map } from "lodash";
import {
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocuments,
  CompletionItemTag
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
  documents: TextDocuments<TextDocument>
): CompletionItem[] {
  const document = textDocumentPosition.textDocument.uri;
  const documentText = documents.get(document)?.getText() ?? "";
  const { cst, tokenVector } = parse(documentText);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  const suggestions = getXMLViewCompletions({
    model: model,
    offset: documents
      .get(document)
      ?.offsetAt(textDocumentPosition.position) as number,
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
    const completionItem: CompletionItem = {
      label: suggestion.ui5Node.name,
      detail: suggestion.ui5Node.description,
      data: suggestion.ui5Node.kind,
      tags: suggestion.ui5Node.deprecatedInfo
        ? [CompletionItemTag.Deprecated]
        : undefined
    };
    return completionItem;
  });
  return lspSuggestions;
}

export function addCompletionDetails(item: CompletionItem): CompletionItem {
  switch (item.data) {
    case "UI5Namespace":
      item.kind = CompletionItemKind.Text;
      break;
    case "UI5Prop":
      item.kind = CompletionItemKind.Property;
      break;
    case "UI5Class":
      item.kind = CompletionItemKind.Class;
      break;
    case "UI5Event":
      item.kind = CompletionItemKind.Event;
      break;
    case "UI5Aggregation":
      item.kind = CompletionItemKind.Text;
      break;
    case "UI5EnumValue":
      item.kind = CompletionItemKind.EnumMember;
      break;
    default:
      item.kind = CompletionItemKind.Text;
  }
  return item;
}

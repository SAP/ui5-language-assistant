import { map } from "lodash";
import {
  CompletionItem,
  CompletionItemKind,
  CompletionItemTag,
  TextDocumentPositionParams,
  InsertTextFormat
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { buildAst, XMLAttribute, XMLElement } from "@xml-tools/ast";
import {
  UI5SemanticModel,
  BaseUI5Node,
  UI5Prop,
  UI5Aggregation,
  UI5Association,
  UI5Field
} from "@ui5-editor-tools/semantic-model-types";
import {
  getXMLViewCompletions,
  UI5XMLViewCompletion
} from "@ui5-editor-tools/xml-views-completion";
import {
  ui5NodeToFQN,
  isRootSymbol,
  typeToString
} from "@ui5-editor-tools/logic-utils";
import { getNodeDocumentation } from "./documentation";

export function getCompletionItems(
  model: UI5SemanticModel,
  textDocumentPosition: TextDocumentPositionParams,
  document: TextDocument
): CompletionItem[] {
  const documentText = document.getText();
  const { cst, tokenVector } = parse(documentText);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  const suggestions = getXMLViewCompletions({
    model: model,
    offset: document.offsetAt(textDocumentPosition.position),
    cst: cst as DocumentCstNode,
    ast: ast,
    tokenVector: tokenVector
  });

  return transformToLspSuggestions(suggestions, model);
}

function transformToLspSuggestions(
  suggestions: UI5XMLViewCompletion[],
  model: UI5SemanticModel
): CompletionItem[] {
  const lspSuggestions = map(suggestions, suggestion => {
    const lspKind = computeLSPKind(suggestion);
    const completionItem: CompletionItem = {
      label: suggestion.ui5Node.name,
      // TODO use textEdit instead of insertText to support replacing "sap.m.Button" with "Button"
      insertText: createInsertText(suggestion),
      insertTextFormat: InsertTextFormat.Snippet,
      detail: getNodeDetail(suggestion.ui5Node),
      documentation: getNodeDocumentation(suggestion.ui5Node, model),
      kind: lspKind,
      tags: suggestion.ui5Node.deprecatedInfo?.isDeprecated
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
    case "UI5AggregationsInXMLTagName":
      return CompletionItemKind.Text;
    case "UI5PropsInXMLAttributeKey":
      return CompletionItemKind.Property;
    case "UI5ClassesInXMLTagName":
      return CompletionItemKind.Class;
    case "UI5EventsInXMLAttributeKey":
      return CompletionItemKind.Event;
    case "UI5EnumsInXMLAttributeValue":
      return CompletionItemKind.EnumMember;
    default:
      // TODO: we probably need a logging solution to highlight edge cases we
      //       do not handle...
      return CompletionItemKind.Text;
  }
}

function createInsertText(suggestion: UI5XMLViewCompletion): string {
  let insertText = suggestion.ui5Node.name;
  switch (suggestion.type) {
    // Attribute key
    case "UI5NamespacesInXMLAttributeKey": {
      // Auto-insert the selected namespace
      /* istanbul ignore else */
      if ((suggestion.astNode as XMLAttribute).syntax.value === undefined) {
        insertText += `="${ui5NodeToFQN(suggestion.ui5Node)}"`;
      }
      break;
    }
    case "UI5AssociationsInXMLAttributeKey":
    case "UI5EventsInXMLAttributeKey":
    case "UI5PropsInXMLAttributeKey": {
      // Auto-insert ="" for attributes
      /* istanbul ignore else */
      if ((suggestion.astNode as XMLAttribute).syntax.value === undefined) {
        insertText += '="${0}"';
      }
      break;
    }
    // Tag name
    case "UI5AggregationsInXMLTagName": {
      // Auto-close tag
      /* istanbul ignore else */
      if ((suggestion.astNode as XMLElement).syntax.closeBody === undefined) {
        insertText += `>\${0}</${suggestion.ui5Node.name}>`;
      }
      break;
    }
    case "UI5ClassesInXMLTagName": {
      // Auto-close tag and put the cursor where attributes can be added
      /* istanbul ignore else */
      if ((suggestion.astNode as XMLElement).syntax.closeBody === undefined) {
        insertText += ` \${1}>\${0}</${suggestion.ui5Node.name}>`;
      }
      break;
    }
  }

  return insertText;
}

function getNodeDetail(node: BaseUI5Node): string {
  // Types with fully qualified name
  if (isRootSymbol(node)) {
    return ui5NodeToFQN(node);
  }
  switch (node.kind) {
    /* istanbul ignore next */
    case "UI5Prop":
      return `(property) ${node.name}: ${typeToString((node as UI5Prop).type)}`;
    /* istanbul ignore next */
    case "UI5Field":
      return `(field) ${node.name}: ${typeToString((node as UI5Field).type)}`;
    case "UI5Aggregation":
      return `(aggregation) ${node.name}: ${typeToString(
        (node as UI5Aggregation).type
      )}`;
    case "UI5Association":
      return `(association) ${node.name}: ${typeToString(
        (node as UI5Association).type
      )}`;
    case "UI5Event":
      return `(event) ${node.name}`;
    case "UI5EnumValue":
    default:
      return node.name;
  }
}

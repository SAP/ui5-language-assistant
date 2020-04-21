import { map, findKey, isEmpty, includes } from "lodash";
import {
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  InsertTextFormat,
  TextEdit,
  Range
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import {
  buildAst,
  DEFAULT_NS,
  SourcePosition,
  XMLAttribute,
  XMLElement
} from "@xml-tools/ast";
import {
  UI5SemanticModel,
  BaseUI5Node,
  UI5Prop,
  UI5Aggregation,
  UI5Association,
  UI5Field
} from "@ui5-language-assistant/semantic-model-types";
import {
  getXMLViewCompletions,
  UI5XMLViewCompletion,
  UI5ClassesInXMLTagNameCompletion
} from "@ui5-language-assistant/xml-views-completion";
import {
  ui5NodeToFQN,
  isRootSymbol,
  typeToString
} from "@ui5-language-assistant/logic-utils";
import { getNodeDocumentation } from "./documentation";
import { Position } from "vscode-languageserver-types";

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

  const completionItems = transformToLspSuggestions(
    suggestions,
    model,
    textDocumentPosition.position
  );
  const first = completionItems[0];
  if (first && first.textEdit) {
    console.log(
      `Document position: ${textDocumentPosition.position.line}:${textDocumentPosition.position.character}`
    );
    console.log(
      `Suggestion range: ${first.textEdit.range.start.line}:${first.textEdit.range.start.character}-${first.textEdit.range.end.line}:${first.textEdit.range.end.character}`
    );
  }
  return completionItems;
}

function transformToLspSuggestions(
  suggestions: UI5XMLViewCompletion[],
  model: UI5SemanticModel,
  originalPosition: Position
): CompletionItem[] {
  const lspSuggestions = map(suggestions, suggestion => {
    const lspKind = computeLSPKind(suggestion);
    let detailText = getNodeDetail(suggestion.ui5Node);
    if (suggestion.ui5Node.experimentalInfo?.isExperimental) {
      detailText = `(experimental) ${detailText}`;
    }
    if (suggestion.ui5Node.deprecatedInfo?.isDeprecated) {
      detailText = `(deprecated) ${detailText}`;
    }

    const completionItem: CompletionItem = {
      label: suggestion.ui5Node.name,
      filterText: getNodeFilterText(suggestion),
      textEdit: createTextEdit(suggestion, originalPosition),
      insertTextFormat: InsertTextFormat.Snippet,
      detail: detailText,
      documentation: getNodeDocumentation(suggestion.ui5Node, model),
      kind: lspKind
      // TODO tags are not supported in Theia: https://che-incubator.github.io/vscode-theia-comparator/status.html
      // tags: suggestion.ui5Node.deprecatedInfo?.isDeprecated
      //   ? [CompletionItemTag.Deprecated]
      //   : undefined
    };
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

function createTextEdit(
  suggestion: UI5XMLViewCompletion,
  originalPosition: Position
): TextEdit {
  let position: SourcePosition | undefined = undefined;
  let insertText = suggestion.ui5Node.name;
  switch (suggestion.type) {
    // Attribute key
    case "UI5NamespacesInXMLAttributeKey": {
      position = getXMLAttributeKeyPosition(suggestion.astNode);
      insertText = `xmlns:${insertText}`;

      // Auto-insert the selected namespace
      /* istanbul ignore else */
      if (suggestion.astNode.syntax.value === undefined) {
        insertText += `="${ui5NodeToFQN(suggestion.ui5Node)}"`;
      }
      break;
    }
    case "UI5AssociationsInXMLAttributeKey":
    case "UI5EventsInXMLAttributeKey":
    case "UI5PropsInXMLAttributeKey": {
      position = getXMLAttributeKeyPosition(suggestion.astNode);

      // Auto-insert ="" for attributes
      /* istanbul ignore else */
      if (suggestion.astNode.syntax.value === undefined) {
        insertText += '="${0}"';
      }
      break;
    }
    // Tag name
    case "UI5AggregationsInXMLTagName": {
      position = getXMLTagNamePosition(suggestion.astNode);
      // Auto-close tag
      /* istanbul ignore else */
      if (suggestion.astNode.syntax.closeBody === undefined) {
        insertText += `>\${0}</${suggestion.ui5Node.name}>`;
      }
      break;
    }
    case "UI5ClassesInXMLTagName": {
      position = getXMLTagNamePosition(suggestion.astNode);
      let closeTagName = insertText;
      const nsPrefix = getClassNamespacePrefix(suggestion);
      if (nsPrefix !== undefined) {
        closeTagName = `${nsPrefix}:${closeTagName}`;
        insertText = `${nsPrefix}:${insertText}`;
      }

      // Auto-close tag and put the cursor where attributes can be added
      /* istanbul ignore else */
      if (suggestion.astNode.syntax.closeBody === undefined) {
        insertText += ` \${1}>\${0}</${closeTagName}>`;
      }
      break;
    }
    // Attribute value
    case "UI5NamespacesInXMLAttributeValue": {
      position = getXMLAttributeValuePosition(suggestion.astNode);
      insertText = `"${ui5NodeToFQN(suggestion.ui5Node)}"`;
      break;
    }
    case "UI5EnumsInXMLAttributeValue": {
      position = getXMLAttributeValuePosition(suggestion.astNode);
      insertText = `"${suggestion.ui5Node.name}"`;
      break;
    }
  }

  return {
    newText: insertText,
    range: positionToRange(position, originalPosition)
  };
}

function getXMLTagNamePosition(
  xmlElement: XMLElement
): SourcePosition | undefined {
  return xmlElement.syntax.openName;
}

function getXMLAttributeKeyPosition(
  xmlAttribute: XMLAttribute
): SourcePosition | undefined {
  return xmlAttribute.syntax.key;
}

function getXMLAttributeValuePosition(
  xmlAttribute: XMLAttribute
): SourcePosition | undefined {
  return xmlAttribute.syntax.value;
}

function positionToRange(
  position: SourcePosition | undefined,
  originalPosition: Position
): Range {
  function isDummyPosition(position: SourcePosition): boolean {
    return position.startLine < 0 || position.endLine < 0;
  }

  // Check it's not a dummy position
  if (position !== undefined && !isDummyPosition(position)) {
    return {
      start: Position.create(position.startLine - 1, position.startColumn - 1),
      end: Position.create(position.endLine - 1, position.endColumn)
    };
  }

  return {
    start: originalPosition,
    end: originalPosition
  };
}

function getClassNamespacePrefix(
  suggestion: UI5ClassesInXMLTagNameCompletion
): string | undefined {
  const xmlElement = suggestion.astNode;
  const parent = suggestion.ui5Node.parent;
  /* istanbul ignore else */
  if (parent !== undefined) {
    const parentFQN = ui5NodeToFQN(parent);
    let xmlnsPrefix = findKey(xmlElement.namespaces, _ => _ === parentFQN);
    // Namespace not defined in imports - guess it
    if (xmlnsPrefix === undefined) {
      xmlnsPrefix = parent.name;
      // TODO add text edit for the missing xmlns attribute definition
    }
    if (
      xmlnsPrefix !== undefined &&
      xmlnsPrefix !== DEFAULT_NS &&
      xmlnsPrefix.length > 0
    ) {
      return xmlnsPrefix;
    }
  }
  return undefined;
}

function getNodeFilterText(suggestion: UI5XMLViewCompletion): string {
  // The filter text is used by VSCode/Theia to filter out suggestions that don't match the text the user wrote.
  // Basically this means that every character being replaced by the TextEdit should exist in the filter text.
  // Since we replace the whole value (tag name/attribute key/attribute value) the filter text should contain
  // everything which should be replaced (including namespace in tag name, surrounding quotation marks etc).
  // By default we replace the simple name of the node so this is the returned filter text.
  // Special cases:
  // - Class name in tag can be filtered by FQN or xmlns:
  //   For sap.f.Cards, user input "f:C" should return "f:Cards"
  //   For sap.m.Button, user input "sap.m.But" should return "sap.m.Button"
  // - Namespace in attribute value can be filtered by FQN
  //   For sap.m.semantic, user input "sap.m." should return "sap.m.semantic"
  // - Namespace in xmlns attribute key should contain the "xmlns:" prefix
  //   For sap.m, user input "xmlns:" should return "xmlns:m"
  // - Attribute values should contain quotation marks
  //   For Small enum value, user input `"S"` should return `"Small"`
  const node = suggestion.ui5Node;
  switch (suggestion.type) {
    case "UI5ClassesInXMLTagName": {
      // In some cases ns will have the namespace and in others name will contain the namespace.
      // If the user explicitly typed a namespace we use it in the filter text (because it's written in the file).
      if (
        !isEmpty(suggestion.astNode.ns) ||
        (suggestion.astNode.name !== null &&
          includes(suggestion.astNode.name, ":"))
      ) {
        const prefix = getClassNamespacePrefix(suggestion);
        // The else case should never happen - if the user entered a namespace in the tag name only classes from
        // that namespace are returned, so the namespace will be returned in the prefix
        /* istanbul ignore else */
        if (prefix !== undefined) {
          return `${prefix}:${node.name}`;
        }
      }
      return ui5NodeToFQN(node);
    }
    case "UI5NamespacesInXMLAttributeValue": {
      return `"${ui5NodeToFQN(node)}"`;
    }
    case "UI5NamespacesInXMLAttributeKey": {
      return `xmlns:${node.name}`;
    }
    case "UI5EnumsInXMLAttributeValue": {
      return `"${node.name}"`;
    }
    default: {
      return node.name;
    }
  }
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

import { map, findKey, find, forEachRight, includes } from "lodash";
import {
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  InsertTextFormat,
  TextEdit,
  Range,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { Position } from "vscode-languageserver-types";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import {
  buildAst,
  DEFAULT_NS,
  SourcePosition,
  XMLAttribute,
  XMLElement,
  XMLDocument,
} from "@xml-tools/ast";
import {
  UI5SemanticModel,
  BaseUI5Node,
  UI5Prop,
  UI5Aggregation,
  UI5Association,
  UI5Field,
} from "@ui5-language-assistant/semantic-model-types";
import {
  getXMLViewCompletions,
  UI5XMLViewCompletion,
  UI5ClassesInXMLTagNameCompletion,
} from "@ui5-language-assistant/xml-views-completion";
import {
  ui5NodeToFQN,
  isRootSymbol,
  typeToString,
} from "@ui5-language-assistant/logic-utils";
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
    tokenVector: tokenVector,
  });

  const completionItems = transformToLspSuggestions(
    suggestions,
    model,
    textDocumentPosition.position
  );
  return completionItems;
}

function transformToLspSuggestions(
  suggestions: UI5XMLViewCompletion[],
  model: UI5SemanticModel,
  originalPosition: Position
): CompletionItem[] {
  const lspSuggestions = map(suggestions, (suggestion) => {
    const lspKind = computeLSPKind(suggestion);
    let detailText = getNodeDetail(suggestion.ui5Node);
    if (suggestion.ui5Node.experimentalInfo?.isExperimental) {
      detailText = `(experimental) ${detailText}`;
    }
    if (suggestion.ui5Node.deprecatedInfo?.isDeprecated) {
      detailText = `(deprecated) ${detailText}`;
    }

    const textEditDetails = createTextEdits(suggestion, originalPosition);
    const completionItem: CompletionItem = {
      label: suggestion.ui5Node.name,
      filterText: textEditDetails.filterText,
      textEdit: textEditDetails.textEdit,
      insertTextFormat: InsertTextFormat.Snippet,
      additionalTextEdits: textEditDetails.additionalTextEdits,
      detail: detailText,
      documentation: getNodeDocumentation(suggestion.ui5Node, model),
      kind: lspKind,
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
      return CompletionItemKind.Module;
    case "UI5AssociationsInXMLAttributeKey":
      return CompletionItemKind.Reference;
    case "UI5AggregationsInXMLTagName":
      return CompletionItemKind.Field;
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

function createTextEdits(
  suggestion: UI5XMLViewCompletion,
  originalPosition: Position
): { textEdit: TextEdit; filterText: string; additionalTextEdits: TextEdit[] } {
  const additionalTextEdits: TextEdit[] = [];
  let range: Range = {
    start: originalPosition,
    end: originalPosition,
  };
  let newText = suggestion.ui5Node.name;

  // The filter text is used by VSCode/Theia to filter out suggestions that don't match the text the user wrote.
  // Every character being replaced by the TextEdit (until the cursor position) should exist in the filter text.
  // Since we replace the whole value (tag name/attribute key/attribute value) the filter text should contain
  // the entire prefix (including the xml namespace in tag name, surrounding quotation marks for attribute value etc).
  // In simple cases (like property name) this will be the name of the UI5 node.
  let filterText = newText;
  switch (suggestion.type) {
    // Attribute key
    case "UI5NamespacesInXMLAttributeKey": {
      // The 'else' part will never happen because to get suggestions for xmlns attribute, the attribute key must exist
      /* istanbul ignore next */
      range = getXMLAttributeKeyRange(suggestion.astNode) ?? range;
      newText = `xmlns:${newText}`;
      // Namespace in xmlns attribute key should contain the "xmlns:" prefix
      filterText = newText;

      // Auto-insert the selected namespace
      if (suggestion.astNode.syntax.value === undefined) {
        newText += `="${ui5NodeToFQN(suggestion.ui5Node)}"`;
      }
      break;
    }
    case "UI5AssociationsInXMLAttributeKey":
    case "UI5EventsInXMLAttributeKey": {
      range = getXMLAttributeKeyRange(suggestion.astNode) ?? range;

      // Auto-insert ="" for attributes
      if (suggestion.astNode.syntax.value === undefined) {
        // The LSP tabstop ${0} puts the cursor in the marked place, between the quotes, so they can easily
        // type the attribute value
        newText += '="${0}"';
      }
      break;
    }
    case "UI5PropsInXMLAttributeKey": {
      range = getXMLAttributeKeyRange(suggestion.astNode) ?? range;

      // Auto-insert ="<default value>" (or ="" if there is no default value) for property attributes
      if (suggestion.astNode.syntax.value === undefined) {
        const defaultValue = suggestion.ui5Node.default;
        // Only simple values are added in the completion (there are default values which are objects, arrays and null)
        if (
          defaultValue !== undefined &&
          includes(["number", "boolean", "string"], typeof defaultValue)
        ) {
          // The LSP placeholder ${0:} makes the text between : and } selected so the user can easily
          // change it if they don't want to use the default value
          newText += `="\${0:${defaultValue}}"`;
        } else {
          // The LSP tabstop ${0} puts the cursor in the marked place, between the quotes, so they can easily
          // type the attribute value
          newText += '="${0}"';
        }
      }
      break;
    }
    // Tag name
    case "UI5AggregationsInXMLTagName": {
      range = getXMLTagNameRange(suggestion.astNode) ?? range;
      const tagName = suggestion.ui5Node.name;
      // Auto-close tag
      /* istanbul ignore else */
      if (shouldCloseXMLElement(suggestion.astNode)) {
        newText += `>\${0}</${tagName}>`;
      } else {
        additionalTextEdits.push(
          ...getClosingTagTextEdits(suggestion.astNode, tagName)
        );
      }
      break;
    }
    case "UI5ClassesInXMLTagName": {
      ({ range, newText, filterText } = createTextEditsForClassInTagName(
        range,
        suggestion,
        additionalTextEdits
      ));
      break;
    }
    // Attribute value
    case "UI5NamespacesInXMLAttributeValue": {
      // The 'else' part will never happen because to get suggestions for attribute value, the "" at least must exist so
      // the attribute value syntax exists
      /* istanbul ignore next */
      range = getXMLAttributeValueRange(suggestion.astNode) ?? range;
      newText = `"${ui5NodeToFQN(suggestion.ui5Node)}"`;
      // Namespace in attribute value can be filtered by FQN (since the FQN is written in the attribute).
      // Attribute values should contain quotation marks.
      filterText = newText;
      break;
    }
    case "UI5EnumsInXMLAttributeValue": {
      // The 'else' part will never happen because to get suggestions for attribute value, the "" at least must exist so
      // the attribute value syntax exists
      /* istanbul ignore next */
      range = getXMLAttributeValueRange(suggestion.astNode) ?? range;
      newText = `"${suggestion.ui5Node.name}"`;
      // Attribute values should contain quotation marks
      filterText = newText;
      break;
    }
  }

  return {
    textEdit: {
      range,
      newText,
    },
    filterText,
    additionalTextEdits,
  };
}

function createTextEditsForClassInTagName(
  originalRange: Range,
  suggestion: UI5ClassesInXMLTagNameCompletion,
  additionalTextEdits: TextEdit[]
): { range: Range; newText: string; filterText: string } {
  const range = getXMLTagNameRange(suggestion.astNode) ?? originalRange;
  let newText = suggestion.ui5Node.name;
  let tagName = newText;
  const nsPrefix = getClassNamespacePrefix(suggestion, additionalTextEdits);
  if (nsPrefix !== undefined) {
    tagName = `${nsPrefix}:${tagName}`;
    newText = tagName;
  }
  // If the additionalTextEdits are in the same position as the insert text add them to
  // the insert text instead.
  // This could happen if the suggestion is on the root tag and we also want to add the namespace.
  // Looping backwards so we can remove elements from the array.
  forEachRight(additionalTextEdits, (edit, index) => {
    if (rangeContains(range, edit.range)) {
      newText += edit.newText;
      additionalTextEdits.splice(index, 1);
    }
  });
  // Auto-close tag and put the cursor where attributes can be added (only if there is nothing else in this tag)
  /* istanbul ignore else */
  if (shouldCloseXMLElement(suggestion.astNode)) {
    newText += ` \${1}>\${0}</${tagName}>`;
  } else {
    additionalTextEdits.push(
      ...getClosingTagTextEdits(suggestion.astNode, tagName)
    );
  }
  // Class name in tag can be filtered by FQN or xmlns (or none of them): all of "m:But", "But" and "sap.m.But"
  // should return "m:Button" in the tag name for sap.m.Button.
  // Use both namespaced options in the filter text to make sure the result is not filtered out
  // (the simple name option is contained in both).
  const filterText = `${tagName} ${ui5NodeToFQN(suggestion.ui5Node)}`;
  return { range, newText, filterText };
}

function getClosingTagTextEdits(
  xmlElement: XMLElement,
  closingTagName: string
): TextEdit[] {
  const textEdits: TextEdit[] = [];
  // Note: if we implement syncronization between the opening and closing tag in the generic XML extension
  // and it will cover changes done by code assist suggestions this logic should be removed from this extension.

  // Check if the closing tag has a name and it's the same as the opening tag.
  // The name check is required so that in the case of invalid xml where the current tag is closed but
  // has no closing tag, and its parent tag has a closing tag, we don't change the parent closing tag name.
  // For example, in this xml:
  // <parentTag><innerTag></parentTag>
  // The </parentTag> closing tag is considered the closing tag of <innerTag> but we don't want to change it.
  if (
    xmlElement.syntax.closeName !== undefined &&
    xmlElement.syntax.closeName.image === xmlElement.syntax.openName?.image
  ) {
    // Replace name in closing tag
    const closingTagNameRange = positionToRange(xmlElement.syntax.closeName);
    // The 'else' here only happens if the closing tag is a dummy element (which we don't create)
    /* istanbul ignore else */
    if (closingTagNameRange !== undefined) {
      const closingTagNameTextEdit = {
        newText: closingTagName,
        range: closingTagNameRange,
      };
      textEdits.push(closingTagNameTextEdit);
    }
  } else if (
    xmlElement.syntax.closeName === undefined &&
    xmlElement.syntax.closeBody !== undefined
  ) {
    // This is the case where there is a closing tag but it doesn't contain a name (like "</>")
    const closingTagRange = positionToRange(xmlElement.syntax.closeBody);
    // The 'else' here only happens if the closing tag is a dummy element (which we don't create)
    /* istanbul ignore else */
    if (closingTagRange !== undefined) {
      const closingTagTextEdit = {
        newText: `</${closingTagName}>`,
        range: closingTagRange,
      };
      textEdits.push(closingTagTextEdit);
    }
  }
  return textEdits;
}

function shouldCloseXMLElement(xmlElement: XMLElement): boolean {
  // The XML element should be closed only if it doesn't contain anything after the tag name (which is also optional)
  return (
    xmlElement.syntax.closeBody === undefined &&
    (xmlElement.syntax.openName === undefined ||
      xmlElement.syntax.openName.endOffset === xmlElement.position.endOffset)
  );
}

function getXMLTagNameRange(xmlElement: XMLElement): Range | undefined {
  return positionToRange(xmlElement.syntax.openName);
}

function getXMLAttributeKeyRange(
  xmlAttribute: XMLAttribute
): Range | undefined {
  return positionToRange(xmlAttribute.syntax.key);
}

function getXMLAttributeValueRange(
  xmlAttribute: XMLAttribute
): Range | undefined {
  return positionToRange(xmlAttribute.syntax.value);
}

function rangeContains(range: Range, inner: Range): boolean {
  function atMost(position1: Position, position2: Position): boolean {
    return (
      position1.line < position2.line ||
      (position1.line === position2.line &&
        position1.character <= position2.character)
    );
  }
  return atMost(range.start, inner.start) && atMost(inner.end, range.end);
}

/**
 * Create an insert range at the position right after the sent column.
 * For exmaple, for text "12345" the character in position 1 is "1" and the
 * insert position after it is "1|2345".
 * The character in position 2 is "2" and the insert position after it is "12|345".
 * The character at position 5 is "5" and the insert position after it at the end of the text -> "12345|".
 * */
function createInsertRangeAfter(line: number, column: number): Range {
  return {
    start: Position.create(line - 1, column),
    end: Position.create(line - 1, column),
  };
}

/**
 * Create an insert range at the position right before the sent column.
 * For exmaple, for text "12345" the character in position 1 is "1" and the
 * insert position before it is the beginning of the text -> "|12345".
 * The character in position 2 is "2" and the insert position before it is "1|2345".
 * The character at position 5 is "5" and the insert position before it is "1234|5".
 * */
function createInsertRangeBefore(line: number, column: number): Range {
  return {
    start: Position.create(line - 1, column - 1),
    end: Position.create(line - 1, column - 1),
  };
}

function positionToRange(
  position: SourcePosition | undefined
): Range | undefined {
  function isDummyPosition(position: SourcePosition): boolean {
    return position.startLine < 0 || position.endLine < 0;
  }

  // Check it's not a dummy position
  if (position !== undefined && !isDummyPosition(position)) {
    return {
      start: Position.create(position.startLine - 1, position.startColumn - 1),
      end: Position.create(position.endLine - 1, position.endColumn),
    };
  }
  return undefined;
}

function getClassNamespacePrefix(
  suggestion: UI5ClassesInXMLTagNameCompletion,
  additionalTextEdits: TextEdit[]
): string | undefined {
  const xmlElement = suggestion.astNode;
  const parent = suggestion.ui5Node.parent;
  /* istanbul ignore else */
  if (parent !== undefined) {
    const parentFQN = ui5NodeToFQN(parent);
    let xmlnsPrefix = findKey(xmlElement.namespaces, (_) => _ === parentFQN);
    // Namespace not defined in imports - guess it
    if (xmlnsPrefix === undefined) {
      // It should be the parent simple name by default, but if that already exists we'll add an index to it (name2 etc)
      xmlnsPrefix = parent.name;
      let i = 2;
      while (
        find(xmlElement.namespaces, (v, k) => k === xmlnsPrefix) !== undefined
      ) {
        xmlnsPrefix = parent.name + i;
        ++i;
      }
      const addNamespaceEdit = getAddNamespaceEdit(
        xmlElement,
        xmlnsPrefix,
        parentFQN
      );
      // Add text edit for the missing xmlns attribute definition
      // The 'else' should not happen because it would only happen in case we can't find the root element of
      // the document, and in that case we also won't get any suggestions for classes
      /* istanbul ignore else */
      if (addNamespaceEdit !== undefined) {
        additionalTextEdits.push(addNamespaceEdit);
      }
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

function getAddNamespaceEdit(
  xmlElement: XMLElement,
  xmlns: string,
  value: string
): TextEdit | undefined {
  // Add the namespace to the top-level element
  let parent: XMLElement | XMLDocument = xmlElement;
  while (parent.type !== "XMLDocument") {
    parent = parent.parent;
  }
  // The 'else' part will never happen because to get suggestions on class name the open tag must exist so the
  // xml document will not be empty
  /* istanbul ignore else */
  if (parent.rootElement !== null) {
    let range: Range;
    if (parent.rootElement.syntax.openName !== undefined) {
      const position = parent.rootElement.syntax.openName;
      // We want to insert the namespace at the end of the range, after the tag name.
      range = createInsertRangeAfter(position.endLine, position.endColumn);
    } else {
      const position =
        parent.rootElement.syntax.openBody ?? parent.rootElement.position;
      // We want to insert the namespace after the opening tag.
      // There is no tag name so this will be directly after the "<" token
      // (which must exist if there is an open body or rootElement at all).
      // When there is no ">" token the openBody will not exist so we take the rootElement position.
      range = createInsertRangeBefore(
        position.startLine,
        position.startColumn + "<".length
      );
    }

    return {
      range,
      newText: ` xmlns:${xmlns}="${value}"`,
    };
  }
  // See above for why this case is ignored.
  // If we can't find the root element we don't add additional text edits.
  /* istanbul ignore next */
  return undefined;
}

function getNodeDetail(node: BaseUI5Node): string {
  // Types with fully qualified name
  if (isRootSymbol(node)) {
    return ui5NodeToFQN(node);
  }
  switch (node.kind) {
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

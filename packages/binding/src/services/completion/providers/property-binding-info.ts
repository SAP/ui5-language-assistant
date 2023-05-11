import {
  parsePropertyBindingInfo,
  PropertyBindingInfoTypes as BindingTypes,
} from "@ui5-language-assistant/binding-parser";
import type { Position } from "vscode-languageserver-types";
import { AttributeValueCompletionOptions } from "@xml-tools/content-assist";
import { CompletionItem } from "vscode-languageserver-types";
import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";

import { BindContext } from "../../../types";
import { createInitialSnippet } from "./create-initial-snippet";
import {
  extractBindingExpression,
  getCursorContext,
  isBindingExpression,
  isPropertyBindingInfo,
} from "../../../utils";
import { createAllSupportedElements } from "./create-all-supported-elements";
import { createKeyProperties } from "./create-key-properties";
import { createValue } from "./create-value";
import { createKeyValue } from "./create-key-value";

export const getCompletionItems = (
  context: BindContext,
  ast: BindingTypes.Ast,
  spaces: BindingTypes.WhiteSpaces[],
  text = "",
  collection = false
): CompletionItem[] => {
  const completionItems: CompletionItem[] = [];
  if (!context.textDocumentPosition?.position) {
    return completionItems;
  }
  const cursorContext = getCursorContext(
    context.textDocumentPosition,
    ast,
    spaces,
    text,
    collection
  );
  switch (cursorContext.type) {
    case "initial":
      return createInitialSnippet(context);
    case "empty":
      return createAllSupportedElements(context, ast);
    case "key":
      return createKeyProperties(cursorContext.element);
    case "value":
      return createValue(context, spaces, cursorContext);
    case "key-value":
      return createKeyValue(context, ast);
    case "colon":
      if (!cursorContext.element.value) {
        // create value
        return createValue(context, spaces, cursorContext);
      }
      return completionItems;
    default:
      break;
  }
  return completionItems;
};

/**
 * Suggests values for property binding info
 */
export function propertyBindingInfoSuggestions({
  attribute,
  context,
}: AttributeValueCompletionOptions<BindContext>): CompletionItem[] {
  const completionItems: CompletionItem[] = [];
  const ui5Property = getUI5PropertyByXMLAttributeKey(
    attribute,
    context.ui5Model
  );
  if (!ui5Property) {
    return completionItems;
  }
  const value = attribute.syntax.value;
  const startChar = value?.image.charAt(0);
  context.doubleQuotes = startChar === '"';
  const text = attribute.value ?? "";
  const { expression, startIndex } = extractBindingExpression(text);
  if (!isPropertyBindingInfo(expression)) {
    return [];
  }
  if (isBindingExpression(expression)) {
    return [];
  }
  const position: Position = {
    character: (value?.startColumn ?? 0) + startIndex,
    line: value?.startLine ? value.startLine - 1 : 0, // zero based index
  };
  const { ast } = parsePropertyBindingInfo(expression, position);
  completionItems.push(
    ...getCompletionItems(context, ast, ast.spaces, expression)
  );
  return completionItems;
}

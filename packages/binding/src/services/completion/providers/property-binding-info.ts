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
  binding: BindingTypes.Binding,
  spaces: BindingTypes.WhiteSpaces[],
  text = ""
): CompletionItem[] => {
  const completionItems: CompletionItem[] = [];
  if (!context.textDocumentPosition?.position) {
    return completionItems;
  }
  const cursorContext = getCursorContext(
    context.textDocumentPosition,
    binding,
    spaces,
    text
  );
  switch (cursorContext.type) {
    case "empty":
      return createAllSupportedElements(context, binding);
    case "key":
      return createKeyProperties(cursorContext.element);
    case "value":
      return createValue(context, spaces, cursorContext);
    case "key-value":
      return createKeyValue(context, binding);
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
  const extractedBindings = extractBindingExpression(text);
  for (const bindingSyntax of extractedBindings) {
    const { expression, startIndex } = bindingSyntax;
    if (isBindingExpression(expression)) {
      continue;
    }
    const position: Position = {
      character: (value?.startColumn ?? 0) + startIndex,
      line: value?.startLine ? value.startLine - 1 : 0, // zero based index
    };
    const { ast } = parsePropertyBindingInfo(text, position);
    const input = expression;
    if (input.trim() === "") {
      completionItems.push(...createInitialSnippet(context));
      continue;
    }
    for (const binding of ast.bindings) {
      if (!isPropertyBindingInfo(text, binding)) {
        continue;
      }
      completionItems.push(
        ...getCompletionItems(context, binding, ast.spaces, expression)
      );
    }
  }

  return completionItems;
}

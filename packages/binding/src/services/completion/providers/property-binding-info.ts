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
import { getCursorContext, isBindingExpression } from "../../../utils";
import { createAllSupportedElements } from "./create-all-supported-elements";
import { createKeyProperties } from "./create-key-properties";
import { createValue } from "./create-value";
import { createKeyValue } from "./create-key-value";

/**
 * Suggests values for property binding info
 */
export function propertyBindingInfoSuggestions({
  element,
  attribute,
  context,
  prefix,
}: AttributeValueCompletionOptions<BindContext>): CompletionItem[] {
  const completionItems: CompletionItem[] = [];
  const ui5Property = getUI5PropertyByXMLAttributeKey(
    attribute,
    context.ui5Model
  );
  if (
    !(
      ui5Property?.type?.kind === "PrimitiveType" &&
      ui5Property?.type?.name === "String"
    )
  ) {
    return completionItems;
  }
  const text = attribute.value ?? "";
  if (isBindingExpression(text)) {
    return [];
  }
  const value = attribute.syntax.value;
  const position: Position = {
    character: value?.startColumn ?? 0,
    line: value?.startLine ? value.startLine - 1 : 0, // zero based index
  };
  const { ast } = parsePropertyBindingInfo(text, position);
  const cursorContext = getCursorContext(
    context.textDocumentPosition,
    ast,
    text
  );
  switch (cursorContext.type) {
    case "initial":
      return createInitialSnippet();
    case "empty":
      return createAllSupportedElements(ast);
    case "key":
      return createKeyProperties(cursorContext.element);
    case "value":
      return createValue(cursorContext.element);
    case "key-value":
      return createKeyValue(ast, cursorContext);
    case "colon":
      if (!cursorContext.element.value) {
        // create value
        return createValue(cursorContext.element);
      }
      return completionItems;
    default:
      break;
  }
  return completionItems;
}

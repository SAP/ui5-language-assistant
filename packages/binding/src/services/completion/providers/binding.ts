import {
  parseBinding,
  BindingParserTypes as BindingTypes,
  rangeContained,
  isBindingAllowed,
  isBindingExpression,
  extractBindingSyntax,
} from "@ui5-language-assistant/binding-parser";
import type { Position } from "vscode-languageserver-types";
import { AttributeValueCompletionOptions } from "@xml-tools/content-assist";
import { CompletionItem } from "vscode-languageserver-types";
import {
  getUI5PropertyByXMLAttributeKey,
  getUI5AggregationByXMLAttributeKey,
} from "@ui5-language-assistant/logic-utils";

import { BindContext } from "../../../types";
import { createInitialSnippet } from "./create-initial-snippet";
import {
  findPrimitiveTypeInAggregation,
  getCursorContext,
  getLogger,
  isMacrosMetaContextPath,
} from "../../../utils";
import { createAllSupportedElements } from "./create-all-supported-elements";
import { createKeyProperties } from "./create-key-properties";
import { createValue } from "./create-value";
import { createKeyValue } from "./create-key-value";
import { getBindingElements } from "./../../../definition/definition";
import type { UI5Aggregation } from "@ui5-language-assistant/semantic-model-types";

export const getCompletionItems = (
  context: BindContext,
  binding: BindingTypes.StructureValue,
  spaces: BindingTypes.WhiteSpaces[],
  /* istanbul ignore next */
  aggregation: UI5Aggregation | undefined = undefined,
  /* istanbul ignore next */
  bindingElements = getBindingElements(context, aggregation)
): CompletionItem[] => {
  const completionItems: CompletionItem[] = [];
  /* istanbul ignore next */
  if (!context.textDocumentPosition?.position) {
    return completionItems;
  }
  const cursorContext = getCursorContext(
    context.textDocumentPosition,
    binding,
    spaces
  );
  switch (cursorContext.type) {
    case "empty":
      return createAllSupportedElements(context, bindingElements);
    case "key":
      return createKeyProperties(cursorContext.element, bindingElements);
    case "value":
      return createValue(
        context,
        spaces,
        cursorContext,
        bindingElements,
        aggregation
      );
    case "key-value":
      return createKeyValue(context, binding, bindingElements);
  }
  return completionItems;
};

/**
 * Suggests values for binding
 */
export function bindingSuggestions({
  attribute,
  context,
}: AttributeValueCompletionOptions<BindContext>): CompletionItem[] {
  const completionItems: CompletionItem[] = [];
  try {
    // `metaPath` and `contextPath` of 'sap.fe.macros' is static
    if (isMacrosMetaContextPath(attribute)) {
      return completionItems;
    }
    const ui5Property = getUI5PropertyByXMLAttributeKey(
      attribute,
      context.ui5Model
    );
    const ui5Aggregation = getUI5AggregationByXMLAttributeKey(
      attribute,
      context.ui5Model
    );
    if (!ui5Property && !ui5Aggregation) {
      return completionItems;
    }
    const propBinding = getBindingElements(context, ui5Aggregation, false);
    const properties = propBinding.map((i) => i.name);
    const value = attribute.syntax.value;
    const startChar = value && value.image.charAt(0);
    context.doubleQuotes = startChar === '"';
    /* istanbul ignore next */
    const text = attribute.value ?? "";
    const extractedBindings = extractBindingSyntax(text);
    for (const bindingSyntax of extractedBindings) {
      const { expression, startIndex } = bindingSyntax;
      if (isBindingExpression(expression)) {
        continue;
      }
      /* istanbul ignore next */
      const position: Position = {
        character: (value?.startColumn ?? 0) + startIndex,
        line: value?.startLine ? value.startLine - 1 : 0, // zero based index
      };
      const { ast, errors } = parseBinding(expression, position);
      const input = expression;
      if (input.trim() === "") {
        completionItems.push(...createInitialSnippet());
        continue;
      }
      /* istanbul ignore next */
      const cursorPos = context.textDocumentPosition?.position;
      const binding = ast.bindings.find(
        (b) =>
          cursorPos &&
          b.range &&
          rangeContained(b.range, { start: cursorPos, end: cursorPos })
      );
      if (!binding) {
        continue;
      }
      if (!isBindingAllowed(text, binding, errors, properties)) {
        continue;
      }
      completionItems.push(
        ...getCompletionItems(
          context,
          binding,
          ast.spaces,
          ui5Aggregation,
          propBinding
        )
      );
    }

    const altTypes = findPrimitiveTypeInAggregation(ui5Aggregation);
    if (altTypes) {
      // for `altTypes`, `PROPERTY_BINDING_INFO` properties are added (duplicate allowed)
      return completionItems;
    }
    // Remove duplicates
    const uniqueCompletionItems = Array.from(
      new Map(completionItems.map((item) => [item.label, item])).values()
    );
    return uniqueCompletionItems;
  } catch (error) {
    getLogger().debug("bindingSuggestions failed:", error);
    return [];
  }
}

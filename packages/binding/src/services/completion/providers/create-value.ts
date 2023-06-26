import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
} from "vscode-languageserver-types";
import {
  isCollectionValue,
  isStructureValue,
  positionContained,
  isBefore,
  BindingParserTypes as BindingTypes,
  rangeContained,
} from "@ui5-language-assistant/binding-parser";

import { getPropertyBindingInfoElements } from "../../../definition/definition";
import { isParts, typesToValue } from "../../../utils";
import { getCompletionItems } from "./property-binding-info";
import { BindContext, ValueContext } from "../../../types";
import { createDefaultValue } from "./create-default-value";

const getCollectionCompletionItem = (
  context: BindContext,
  element: BindingTypes.StructureElement
): CompletionItem[] => {
  const bindingElement = getPropertyBindingInfoElements(context).find(
    (el) => el.name === (element.key && element.key.text)
  );
  const data = typesToValue(
    /* istanbul ignore next */
    bindingElement?.type ?? [],
    context,
    0,
    true
  );
  return data.map((item) => ({
    label: item.replace(/\$\d+/g, ""),
    insertTextFormat: InsertTextFormat.Snippet,
    insertText: item,
    kind: CompletionItemKind.Field,
  }));
};

export const createValue = (
  context: BindContext,
  spaces: BindingTypes.WhiteSpaces[],
  valueContext: ValueContext
): CompletionItem[] => {
  const completionItems: CompletionItem[] = [];
  const { element } = valueContext;
  const text = element.key && element.key.text;
  const bindingElement = getPropertyBindingInfoElements(context).find(
    (el) => el.name === text
  );
  if (!element.value) {
    // if value is missing, provide a value
    if (bindingElement) {
      const data = typesToValue(bindingElement.type, context, 0);
      data.forEach((item) => {
        completionItems.push({
          label: item.replace(/\$\d+/g, ""),
          insertTextFormat: InsertTextFormat.Snippet,
          insertText: item,
          kind: CompletionItemKind.Field,
        });
      });
    }
    return completionItems;
  }

  completionItems.push(...createDefaultValue(context, valueContext));
  if (isCollectionValue(element.value) && isParts(element)) {
    /* istanbul ignore next */
    const position = context.textDocumentPosition?.position;
    if (!position) {
      return completionItems;
    }
    const el = element.value.elements
      .filter((item) => !!item)
      .find((item) => positionContained(item.range, position));

    if (isStructureValue(el)) {
      if (
        (el.leftCurly && isBefore(position, el.leftCurly.range.start, true)) ||
        (el.rightCurly && isBefore(el.rightCurly.range.end, position, true))
      ) {
        // position is outside {}
        return getCollectionCompletionItem(context, element);
      }
      const result = getCompletionItems(context, el, spaces).filter(
        (item) => item.label !== "parts"
      );
      return result;
    }
    if (
      element.value.range &&
      (isBefore(position, element.value.range.start, true) ||
        isBefore(element.value.range.end, position, true))
    ) {
      // position is outside []
      return completionItems;
    }
    if (el && rangeContained(el.range, { start: position, end: position })) {
      // on primitive value e.g '|'
      return completionItems;
    }
    return getCollectionCompletionItem(context, element);
  }
  return completionItems;
};

import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
} from "vscode-languageserver-types";
import {
  isCollectionValue,
  isPrimitiveValue,
  isStructureValue,
  positionContained,
  isBefore,
  BindingParserTypes as BindingTypes,
} from "@ui5-language-assistant/binding-parser";

import { propertyBindingInfoElements } from "../../../definition/definition";
import { isParts, typesToValue } from "../../../utils";
import { getCompletionItems } from "./property-binding-info";
import { BindContext, ValueContext } from "../../../types";

const getCollectionCompletionItem = (
  context: BindContext,
  element: BindingTypes.StructureElement
): CompletionItem[] => {
  const bindingElement = propertyBindingInfoElements.find(
    (el) => el.name === (element.key && element.key.text)
  );
  const data = typesToValue(
    /* istanbul ignore next */
    bindingElement?.type ?? [],
    context,
    true
  );
  return data.map((item) => ({
    label: item,
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
  if (isPrimitiveValue(element.value)) {
    if (element.value.text === "true" || element.value.text === "false") {
      const range = element.value.range;
      let data: CompletionItem = {
        label: "false",
        insertTextFormat: InsertTextFormat.Snippet,
        insertText: "false",
        kind: CompletionItemKind.Field,
      };
      if (range) {
        data.textEdit = {
          range,
          newText: "false",
        };
      }
      completionItems.push(data);
      data = {
        label: "true",
        insertTextFormat: InsertTextFormat.Snippet,
        insertText: "true",
        kind: CompletionItemKind.Field,
      };
      if (range) {
        data.textEdit = {
          range,
          newText: "true",
        };
      }
      completionItems.push(data);
    }
    return completionItems;
  }
  if (!element.value) {
    // if value is missing, provide a value
    const text = element.key && element.key.text;
    const bindingElement = propertyBindingInfoElements.find(
      (el) => el.name === text
    );
    if (bindingElement) {
      const data = typesToValue(bindingElement.type, context);
      data.forEach((item) => {
        completionItems.push({
          label: item,
          insertTextFormat: InsertTextFormat.Snippet,
          insertText: item,
          kind: CompletionItemKind.Field,
        });
      });
    }
    return completionItems;
  }
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
      // check if position is outside {}
      if (
        (el.leftCurly && isBefore(position, el.leftCurly.range.start, true)) ||
        (el.rightCurly && isBefore(el.rightCurly.range.end, position, true))
      ) {
        return getCollectionCompletionItem(context, element);
      }
      const result = getCompletionItems(context, el, spaces).filter(
        (item) => item.label !== "parts"
      );
      return result;
    }
    // check if position is outside []
    if (
      element.value.range &&
      (isBefore(position, element.value.range.start, true) ||
        isBefore(element.value.range.end, position, true))
    ) {
      return completionItems;
    }

    return getCollectionCompletionItem(context, element);
  }
  return completionItems;
};

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
  BindingParserTypes as BindingTypes,
} from "@ui5-language-assistant/binding-parser";

import { propertyBindingInfoElements } from "../../../definition/definition";
import { isParts, typesToValue } from "../../../utils";
import { getCompletionItems } from "./property-binding-info";
import { BindContext, ColonContext, ValueContext } from "../../../types";

export const createValue = (
  context: BindContext,
  spaces: BindingTypes.WhiteSpaces[],
  valueContext: ValueContext | ColonContext
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
  }
  if (!element.value) {
    // if value is missing, provide a value
    const text = element.key && element.key.text;
    const bindingElement = propertyBindingInfoElements.find(
      (el) => el.name === text
    );
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
  } else if (isCollectionValue(element.value) && isParts(element)) {
    /* istanbul ignore next */
    const position = context.textDocumentPosition?.position;
    if (position) {
      const el = element.value.elements
        .filter((item) => !!item)
        .find((item) => positionContained(item.range, position));

      if (isStructureValue(el)) {
        const result = getCompletionItems(context, el, spaces).filter(
          (item) => item.label !== "parts"
        );
        completionItems.push(...result);
      }
      if (!el) {
        const bindingElement = propertyBindingInfoElements.find(
          (el) => el.name === (element.key && element.key.text)
        );
        const data = typesToValue(
          /* istanbul ignore next */
          bindingElement?.type ?? [],
          context,
          0,
          true
        );
        data.forEach((item) =>
          completionItems.push({
            label: item.replace(/\$\d+/g, ""),
            insertTextFormat: InsertTextFormat.Snippet,
            insertText: item,
            kind: CompletionItemKind.Field,
          })
        );
      }
    }
  }
  return completionItems;
};

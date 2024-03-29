import { BindContext, BindingInfoElement, ValueContext } from "../../../types";
import { getPropertyTypeWithPossibleValue } from "../../../utils";
import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
} from "vscode-languageserver-types";

const getText = (
  context: BindContext,
  input: string | boolean,
  tabStop = true
): string => {
  if (typeof input === "boolean") {
    return `${input}`;
  }
  if (tabStop) {
    return context.doubleQuotes ? `'${input}$0'` : `"${input}$0"`;
  }
  return context.doubleQuotes ? `'${input}'` : `"${input}"`;
};

export const createDefaultValue = (
  context: BindContext,
  valueContext: ValueContext,
  bindingElements: BindingInfoElement[]
): CompletionItem[] => {
  const completionItems: CompletionItem[] = [];
  const { element } = valueContext;
  /* istanbul ignore next */
  const text = element.key?.text;
  const bindingElement = bindingElements.find((el) => el.name === text);
  const bindingType = getPropertyTypeWithPossibleValue(element, bindingElement);
  if (bindingType) {
    /* istanbul ignore next */
    const range = element.value?.range;
    /* istanbul ignore next */
    bindingType.possibleValue?.values.forEach((i) => {
      const label = getText(context, i, false);
      const newText = getText(context, i);
      const data: CompletionItem = {
        label,
        insertTextFormat: InsertTextFormat.Snippet,
        insertText: newText,
        kind: CompletionItemKind.Field,
      };
      if (range) {
        data.textEdit = {
          range,
          newText,
        };
      }
      completionItems.push(data);
    });
    return completionItems;
  }
  return completionItems;
};

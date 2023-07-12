import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
} from "vscode-languageserver-types";
import { BindingParserTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";

import { getPropertyBindingInfoElements } from "../../../definition/definition";
import { typesToValue } from "../../../utils";
import { BindContext, ValueContext } from "../../../types";
import { createDefaultValue } from "./create-default-value";
import { createCollectionValue } from "./create-collection-value";

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
  completionItems.push(...createCollectionValue(context, spaces, valueContext));
  return completionItems;
};

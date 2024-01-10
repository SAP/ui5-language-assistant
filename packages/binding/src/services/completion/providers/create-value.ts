import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
} from "vscode-languageserver-types";
import { BindingParserTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";

import { typesToValue } from "../../../utils";
import { BindContext, BindingInfoElement, ValueContext } from "../../../types";
import { createDefaultValue } from "./create-default-value";
import { createCollectionValue } from "./create-collection-value";
import { createStructureValue } from "./create-structure-value";
import type { UI5Aggregation } from "@ui5-language-assistant/semantic-model-types";

export const createValue = (
  context: BindContext,
  spaces: BindingTypes.WhiteSpaces[],
  valueContext: ValueContext,
  bindingElements: BindingInfoElement[],
  aggregation?: UI5Aggregation
): CompletionItem[] => {
  const completionItems: CompletionItem[] = [];
  const { element } = valueContext;
  const text = element.key && element.key.text;
  const bindingElement = bindingElements.find((el) => el.name === text);
  if (!element.value) {
    // if value is missing, provide a value
    if (bindingElement) {
      const data = typesToValue({
        types: bindingElement.type,
        context,
        tabStop: 0,
      });
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

  completionItems.push(
    ...createDefaultValue(context, valueContext, bindingElements)
  );
  completionItems.push(
    ...createStructureValue(
      context,
      spaces,
      valueContext,
      bindingElements,
      aggregation
    )
  );
  completionItems.push(
    ...createCollectionValue(
      context,
      spaces,
      valueContext,
      bindingElements,
      aggregation
    )
  );
  return completionItems;
};

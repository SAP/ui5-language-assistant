import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
} from "vscode-languageserver-types";
import { PropertyBindingInfoTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";

import { propertyBindingInfoElements } from "../../../definition/definition";
import { getDocumentation } from "./documentation";

export const createKeyProperties = (
  element: BindingTypes.AstElement
): CompletionItem[] => {
  const completionItems: CompletionItem[] = [];
  propertyBindingInfoElements.forEach((item) => {
    const documentation = getDocumentation(item);
    const range = element.key?.range;
    const data: CompletionItem = {
      label: item.name,
      insertTextFormat: InsertTextFormat.Snippet,
      insertText: item.name,
      kind: CompletionItemKind.Field,
      documentation,
    };
    if (range) {
      data.textEdit = {
        range,
        newText: item.name,
      };
    }
    completionItems.push(data);
  });
  return completionItems;
};

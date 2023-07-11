import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
} from "vscode-languageserver-types";
import { BindingParserTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";

import { getPropertyBindingInfoElements } from "../../../definition/definition";
import { BindContext } from "../../../types";

export const createKeyProperties = (
  context: BindContext,
  element: BindingTypes.StructureElement
): CompletionItem[] => {
  return getPropertyBindingInfoElements(context).map((item) => {
    const data: CompletionItem = {
      label: item.name,
      insertTextFormat: InsertTextFormat.Snippet,
      insertText: item.name,
      kind: CompletionItemKind.Field,
      documentation: item.documentation,
    };
    if (element.key && element.key.range) {
      data.textEdit = {
        range: element.key.range,
        newText: item.name,
      };
    }
    return data;
  });
};

import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
} from "vscode-languageserver-types";
import { BindingParserTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";

import { getBindingElements } from "../../../definition/definition";
import { typesToValue } from "../../../utils";
import { BindContext } from "../../../types";

export const createKeyValue = (
  context: BindContext,
  binding: BindingTypes.StructureValue,
  aggregation = false
): CompletionItem[] => {
  // exclude duplicate
  return getBindingElements(context, aggregation)
    .filter((item) => {
      if (
        !binding.elements.find(
          (data) => data.key && data.key.text === item.name
        )
      ) {
        return true;
      }
      return false;
    })
    .map((item) => {
      const type = typesToValue({ types: item.type, context, tabStop: 0 });
      const text = `${item.name}: ${type.length === 1 ? type[0] : "$0"}`;
      return {
        label: item.name,
        insertTextFormat: InsertTextFormat.Snippet,
        insertText: text,
        kind: CompletionItemKind.Snippet,
        documentation: item.documentation,
      };
    });
};

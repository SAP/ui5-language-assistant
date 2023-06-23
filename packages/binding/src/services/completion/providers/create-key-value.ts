import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
} from "vscode-languageserver-types";
import { BindingParserTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";

import { getPropertyBindingInfoElements } from "../../../definition/definition";
import { typesToValue } from "../../../utils";
import { getDocumentation } from "./documentation";
import { BindContext } from "../../../types";

export const createKeyValue = (
  context: BindContext,
  binding: BindingTypes.StructureValue
): CompletionItem[] => {
  // exclude duplicate
  return getPropertyBindingInfoElements(context)
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
      const type = typesToValue(item.type, context, 0);
      const text = `${item.name}: ${type.length === 1 ? type[0] : "$0"}`;
      const documentation = getDocumentation(item);
      return {
        label: item.name,
        insertTextFormat: InsertTextFormat.Snippet,
        insertText: text,
        kind: CompletionItemKind.Snippet,
        documentation,
      };
    });
};

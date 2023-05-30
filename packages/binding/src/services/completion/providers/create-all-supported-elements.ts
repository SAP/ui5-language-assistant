import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
} from "vscode-languageserver-types";
import { PropertyBindingInfoTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
import { propertyBindingInfoElements } from "../../../definition/definition";
import { typesToValue } from "../../../utils";
import { getDocumentation } from "./documentation";
import { BindContext } from "../../../types";

/**
 * Create all supported elements
 */
export const createAllSupportedElements = (
  context: BindContext,
  binding: BindingTypes.Binding
): CompletionItem[] => {
  const completionItems: CompletionItem[] = [];
  propertyBindingInfoElements.forEach((item) => {
    const type = typesToValue(item.type, context);
    let text = "";
    if (type.length === 1) {
      text = `${item.name}: ${type[0]}`;
    } else {
      let choice = type.join(",");
      choice = choice.replace(/\$0/g, "");
      choice = "${1|" + choice + "|}$0";
      text = `${item.name}: ${choice}`;
    }
    const documentation = getDocumentation(item);
    completionItems.push({
      label: item.name,
      insertTextFormat: InsertTextFormat.Snippet,
      insertText: text,
      kind: CompletionItemKind.Snippet,
      documentation,
    });
  });
  return completionItems;
};

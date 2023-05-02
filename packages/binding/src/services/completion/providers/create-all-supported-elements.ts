import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
} from "vscode-languageserver-types";
import { PropertyBindingInfoTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
import { propertyBindingInfoElements } from "../../../definition/definition";
import { typesToValue } from "../../../utils";
import { getDocumentation } from "./documentation";

/**
 *
 * @param ast
 * @returns
 */
export const createAllSupportedElements = (
  ast: BindingTypes.Ast
): CompletionItem[] => {
  const completionItems: CompletionItem[] = [];
  propertyBindingInfoElements.forEach((item) => {
    const type = typesToValue(item.type);
    let text = "";
    if (type.length === 1) {
      text = `${item.name}: ${type[0]}${ast.rightCurly ? "" : "}"}`;
    } else {
      let choice = type.join(",");
      choice = choice.replace(/\$0/g, "");
      choice = "${1|" + choice + "|}$0";
      text = `${item.name}: ${choice}${ast.rightCurly ? "" : "}"}`;
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

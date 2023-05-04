import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
} from "vscode-languageserver-types";
import { PropertyBindingInfoTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";

import { propertyBindingInfoElements } from "../../../definition/definition";
import { typesToValue } from "../../../utils";
import { getDocumentation } from "./documentation";
import { PropertyBindingInfoElement } from "../../../types";

export const createKeyValue = (ast: BindingTypes.Ast): CompletionItem[] => {
  const completionItems: CompletionItem[] = [];
  // exclude duplicate
  const remaining: PropertyBindingInfoElement[] = [];
  propertyBindingInfoElements.forEach((item) => {
    if (!ast.elements.find((data) => data.key?.text === item.name)) {
      remaining.push(item);
    }
  });
  remaining.forEach((item) => {
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

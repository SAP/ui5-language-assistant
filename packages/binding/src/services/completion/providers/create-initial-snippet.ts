import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
} from "vscode-languageserver-types";

import { propertyBindingInfoElements } from "../../../definition/definition";

export const createInitialSnippet = (): CompletionItem[] => {
  const completionItems: CompletionItem[] = [];
  const names = propertyBindingInfoElements.map((item) => item.name);
  let text = "{ ${1|" + names.join(",") + "|}: ${2|' ',true,false,{ }|}$0 }";
  completionItems.push({
    label: "{ }",
    insertTextFormat: InsertTextFormat.Snippet,
    insertText: text,
    kind: CompletionItemKind.Snippet,
  });
  text = "{= $0 }";
  completionItems.push({
    label: "{= }",
    insertTextFormat: InsertTextFormat.Snippet,
    insertText: text,
    kind: CompletionItemKind.Snippet,
  });
  text = "{:= $0 }";
  completionItems.push({
    label: "{:= }",
    insertTextFormat: InsertTextFormat.Snippet,
    insertText: text,
    kind: CompletionItemKind.Snippet,
  });
  return completionItems;
};

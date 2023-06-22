import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
} from "vscode-languageserver-types";

export const createInitialSnippet = (): CompletionItem[] => {
  const completionItems: CompletionItem[] = [];
  let text = "{ $0 }";
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

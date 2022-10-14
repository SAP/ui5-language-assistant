import { CompletionItem } from "vscode-languageserver";

export function getCompletionItems(): CompletionItem[] {
  try {
    return [{ label: "test01", kind: 10 }];
  } catch (error) {
    console.log(`Completion items failed`, error);
    return [];
  }
}

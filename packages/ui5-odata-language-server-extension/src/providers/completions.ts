import { ExtensionCompletionParams } from "@ui5-language-assistant/ui5-language-server-extension-types";
import { CompletionItem } from "vscode-languageserver";

export async function getCompletionItems({
  documentPath,
  ast,
  cst,
  offset,
  tokenVector,
  ui5Model,
  documentSettings,
}: ExtensionCompletionParams): Promise<CompletionItem[]> {
  try {
    return [{ label: "test01", kind: 10 }];
  } catch (error) {
    console.log(`Completion items failed`, error);
    return [];
  }
}

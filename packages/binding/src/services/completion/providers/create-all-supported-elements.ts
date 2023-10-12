import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
} from "vscode-languageserver-types";
import { typesToValue } from "../../../utils";
import { BindContext, BindingInfoElement } from "../../../types";

/**
 * Create all supported elements
 */
export const createAllSupportedElements = (
  context: BindContext,
  bindingElements: BindingInfoElement[]
): CompletionItem[] => {
  return bindingElements.map((item) => {
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

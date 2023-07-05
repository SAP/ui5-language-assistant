import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
} from "vscode-languageserver-types";
import { getPropertyBindingInfoElements } from "../../../definition/definition";
import { typesToValue } from "../../../utils";
import { BindContext } from "../../../types";

/**
 * Create all supported elements
 */
export const createAllSupportedElements = (
  context: BindContext
): CompletionItem[] => {
  return getPropertyBindingInfoElements(context).map((item) => {
    const type = typesToValue(item.type, context, 0);
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

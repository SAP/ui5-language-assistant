import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
} from "vscode-languageserver-types";
import { getBindingElements } from "../../../definition/definition";
import { typesToValue } from "../../../utils";
import { BindContext } from "../../../types";

/**
 * Create all supported elements
 */
export const createAllSupportedElements = (
  context: BindContext,
  aggregation = false
): CompletionItem[] => {
  return getBindingElements(context, aggregation).map((item) => {
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

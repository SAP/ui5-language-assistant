import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
} from "vscode-languageserver-types";
import { propertyBindingInfoElements } from "../../../definition/definition";
import { typesToValue } from "../../../utils";
import { getDocumentation } from "./documentation";
import { BindContext } from "../../../types";

/**
 * Create all supported elements
 */
export const createAllSupportedElements = (
  context: BindContext
): CompletionItem[] => {
  return propertyBindingInfoElements.map((item) => {
    const type = typesToValue(item.type, context, 0);
    const text = `${item.name}: ${type.length === 1 ? type[0] : "$0"}`;
    const documentation = getDocumentation(item);
    return {
      label: item.name,
      insertTextFormat: InsertTextFormat.Snippet,
      insertText: text,
      kind: CompletionItemKind.Snippet,
      documentation,
    };
  });
};

import { filter, includes } from "lodash";
import { getSuggestions } from "@xml-tools/content-assist";
import { UI5Visibility } from "@ui5-language-assistant/semantic-model-types";
import {
  GetXMLViewCompletionsOpts,
  UI5XMLViewCompletion,
  UI5NodeXMLViewCompletion,
  LiteralXMLViewCompletion
} from "../api";
import { elementNameProviders } from "./providers/elementName";
import { attributeNameProviders } from "./providers/attributeName";
import { attributeValueProviders } from "./providers/attributeValue";

export function getXMLViewCompletions(
  opts: GetXMLViewCompletionsOpts
): UI5XMLViewCompletion[] {
  const suggestions = getSuggestions({
    offset: opts.offset,
    cst: opts.cst,
    ast: opts.ast,
    tokenVector: opts.tokenVector,
    context: opts.model,
    providers: {
      elementContent: [],
      elementName: elementNameProviders,
      attributeName: attributeNameProviders,
      attributeValue: attributeValueProviders
    }
  });

  const allowedVisibility: UI5Visibility[] = ["public", "protected"];
  const publicAndProtectedSuggestions = filter(
    suggestions,
    _ =>
      isLiteralXMLViewCompletion(_) ||
      includes(allowedVisibility, _.ui5Node.visibility)
  );

  return publicAndProtectedSuggestions;
}

export function isLiteralXMLViewCompletion(
  suggestion: UI5XMLViewCompletion
): suggestion is LiteralXMLViewCompletion {
  switch (suggestion.type) {
    case "BooleanValueInXMLAttributeValueCompletion": {
      // This is here so we'll get compilation errors if the type changes
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _: LiteralXMLViewCompletion = suggestion;
      return true;
    }
    default: {
      return false;
    }
  }
}
export function isUI5NodeXMLViewCompletion(
  suggestion: UI5XMLViewCompletion
): suggestion is UI5NodeXMLViewCompletion {
  // Suggestions are either literals or UI5 nodes
  if (isLiteralXMLViewCompletion(suggestion)) {
    return false;
  }
  // This is here so we'll get compilation errors if the type changes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _: UI5NodeXMLViewCompletion = suggestion;
  return true;
}

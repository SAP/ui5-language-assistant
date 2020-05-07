import { filter, includes } from "lodash";
import { getSuggestions } from "@xml-tools/content-assist";
import { UI5Visibility } from "@ui5-language-assistant/semantic-model-types";
import { GetXMLViewCompletionsOpts, UI5XMLViewCompletion } from "../api";
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
      attributeValue: attributeValueProviders,
    },
  });

  const allowedVisibility: UI5Visibility[] = ["public", "protected"];
  const publicAndProtectedSuggestions = filter(suggestions, (_) =>
    includes(allowedVisibility, _.ui5Node.visibility)
  );

  return publicAndProtectedSuggestions;
}

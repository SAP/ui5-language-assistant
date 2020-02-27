import { getSuggestions } from "@xml-tools/content-assist";
import { filter, includes } from "lodash";

import { GetXMLViewCompletionsOpts, XMLViewCompletion } from "../api";
import { elementNameProviders } from "./providers/elementName";
import { UI5Visibility } from "@vscode-ui5/semantic-model-types";

export function getXMLViewCompletions(
  opts: GetXMLViewCompletionsOpts
): XMLViewCompletion[] {
  const suggestions = getSuggestions({
    offset: opts.offset,
    cst: opts.cst,
    ast: opts.ast,
    tokenVector: opts.tokenVector,
    context: opts.model,
    providers: {
      elementContent: [],
      elementName: elementNameProviders,
      attributeName: [],
      attributeValue: []
    }
  });

  const allowedVisibility: UI5Visibility[] = ["public", "protected"];
  const publicAndProtectedSuggestions = filter(suggestions, _ =>
    includes(allowedVisibility, _.ui5Node.visibility)
  );

  return publicAndProtectedSuggestions;
}

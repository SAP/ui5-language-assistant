import { getSuggestions } from "@xml-tools/content-assist";

import { GetXMLViewCompletionsOpts, XMLViewCompletion } from "../api";
import { elementNameProviders } from "./providers/elementName";

export function getXMLViewCompletions(
  opts: GetXMLViewCompletionsOpts
): XMLViewCompletion[] {
  return getSuggestions({
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
}

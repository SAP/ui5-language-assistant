import {
  flattenAggregations,
  isElementSubClass,
} from "@ui5-language-assistant/logic-utils";

import { UI5AggregationsInXMLTagNameCompletion } from "../../../api";
import { map, compact, uniq } from "lodash";
import { UI5ElementNameCompletionOptions } from "./index";
import {
  filterMembersForSuggestion,
  getClassByElement,
} from "../utils/filter-members";

/**
 * Suggests Aggregation inside sap.ui.core.Element
 * For example: 'content' and 'footer' inside `sap.m.Page`
 */
export function aggregationSuggestions(
  opts: UI5ElementNameCompletionOptions
): UI5AggregationsInXMLTagNameCompletion[] {
  const ui5Model = opts.context;
  const prefix = opts.prefix ?? "";
  const xmlElement = opts.element;
  const parentXMLElement = xmlElement.parent;

  // The top level element cannot be an aggregation
  if (parentXMLElement.type === "XMLDocument") {
    return [];
  }

  // An aggregation is always a simple one word name, it may never include XML namespaces.
  if (opts.prefix?.includes(":")) {
    return [];
  }

  const parentUI5Class = getClassByElement(parentXMLElement, ui5Model);
  if (!isElementSubClass(parentUI5Class)) {
    return [];
  }

  const existingAggregations = compact(
    uniq(map(parentXMLElement.subElements, (_) => _.name))
  );

  const uniquePrefixMatchingAggregations = filterMembersForSuggestion(
    flattenAggregations(parentUI5Class),
    prefix,
    existingAggregations
  );

  return map(uniquePrefixMatchingAggregations, (_) => ({
    type: "UI5AggregationsInXMLTagName",
    ui5Node: _,
    astNode: xmlElement,
  }));
}

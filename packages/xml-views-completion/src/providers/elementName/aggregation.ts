import {
  flattenAggregations,
  isElementSubClass,
  getUI5ClassByXMLElement,
  splitQNameByNamespace,
  isSameXMLNSFromPrefix,
} from "@ui5-language-assistant/logic-utils";

import { UI5AggregationsInXMLTagNameCompletion } from "../../../api";
import { map, compact, uniq, reject } from "lodash";
import { UI5ElementNameCompletionOptions } from "./index";
import { filterMembersForSuggestion } from "../utils/filter-members";

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

  const prefixParts = splitQNameByNamespace(prefix);

  // An aggregation must be on the parent tag namespace.
  // We suggest the completion even if the namespace was not defined.
  if (
    prefixParts.prefix !== undefined &&
    !isSameXMLNSFromPrefix(
      parentXMLElement.ns,
      parentXMLElement,
      prefixParts.prefix,
      xmlElement
    )
  ) {
    return [];
  }

  const parentUI5Class = getUI5ClassByXMLElement(parentXMLElement, ui5Model);
  if (!isElementSubClass(parentUI5Class)) {
    return [];
  }

  const existingAggregations = compact(
    uniq(map(parentXMLElement.subElements, (_) => _.name))
  );
  const existingAggregationsWithoutCurrent =
    xmlElement.name === null
      ? existingAggregations
      : reject(existingAggregations, (name) => name === xmlElement.name);

  const uniquePrefixMatchingAggregations = filterMembersForSuggestion(
    flattenAggregations(parentUI5Class),
    prefixParts.localName,
    existingAggregationsWithoutCurrent
  );

  return map(uniquePrefixMatchingAggregations, (_) => ({
    type: "UI5AggregationsInXMLTagName",
    ui5Node: _,
    astNode: xmlElement,
  }));
}

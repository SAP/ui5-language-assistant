import { UI5SemanticModel } from "@vscode-ui5/semantic-model-types";
import { XMLDocument, XMLElement } from "@xml-tools/ast";
import {
  flattenAggregations,
  isControlSubClass
} from "@vscode-ui5/logic-utils";

import { XMLViewCompletion } from "../../../api";
import { map, compact, uniq } from "lodash";
import { UI5ElementNameCompletionOptions } from "./index";
import {
  filterMembersForSuggestion,
  getClassByElement
} from "../utils/filter-members";

/**
 * Suggests Aggregation inside Controls
 * For example: 'content' and 'footer' inside `sap.m.Page`
 */
export function aggregationSuggestions(
  opts: UI5ElementNameCompletionOptions
): XMLViewCompletion[] {
  const parentAstNode = opts.element.parent;

  if (
    !areAggregationSuggestionsApplicable({
      parentAstNode,
      model: opts.context,
      prefix: opts.prefix
    })
  ) {
    return [];
  }

  // The checks in `areAggregationSuggestionsApplicable` ensure this cast.
  const parentXMLElement = parentAstNode as XMLElement;
  const parentUI5Class = getClassByElement(parentXMLElement, opts.context);

  const prefix = opts.prefix ?? "";
  const existingAggregations = compact(
    uniq(map(parentXMLElement.subElements, _ => _.name))
  );

  const uniquePrefixMatchingAggregations = filterMembersForSuggestion(
    flattenAggregations(parentUI5Class),
    prefix,
    existingAggregations
  );

  return map(uniquePrefixMatchingAggregations, _ => ({
    ui5Node: _,
    astNode: opts.element
  }));
}

function areAggregationSuggestionsApplicable(opts: {
  parentAstNode: XMLElement | XMLDocument;
  prefix: string | undefined;
  model: UI5SemanticModel;
}): boolean {
  // The top level element cannot be an aggregation
  if (opts.parentAstNode.type === "XMLDocument") {
    return false;
  }

  // An aggregation is always a simple one word name, it may never include XML namespaces.
  if (opts.prefix && opts.prefix.includes(":")) {
    return false;
  }

  const parentUI5Class = getClassByElement(opts.parentAstNode, opts.model);
  // An Aggregation is always directly nested inside a Control.
  return parentUI5Class !== undefined && isControlSubClass(parentUI5Class);
}

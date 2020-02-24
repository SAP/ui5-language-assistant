import { UI5SemanticModel } from "@vscode-ui5/semantic-model-types";
import { XMLDocument, XMLElement } from "@xml-tools/ast";
import {
  flattenAggregations,
  isControlSubClass,
  xmlToFQN
} from "@vscode-ui5/logic-utils";

import { XMLViewCompletion } from "../../../api";
import { filter, map, compact, uniq, reject, includes } from "lodash";
import { UI5ElementNameCompletionOptions } from "../../types";

/**
 * Suggests Aggregation inside Controls
 * For example: 'content' and 'footer' inside `sap.m.Page`
 */
export function aggregationSuggestions(
  opts: UI5ElementNameCompletionOptions
): XMLViewCompletion[] {
  const parentAstNode = opts.element.parent;

  if (
    areAggregationSuggestionsApplicable({
      parentAstNode,
      model: opts.context,
      prefix: opts.prefix
    }) === false
  ) {
    return [];
  }

  // The checks in `areAggregationSuggestionsApplicable` ensure this cast.
  const parentXMLElement = parentAstNode as XMLElement;
  const parentTagFqn = xmlToFQN(parentXMLElement);
  const model = opts.context;
  const parentUI5Class = model.classes[parentTagFqn];
  const allAggregations = flattenAggregations(parentUI5Class);
  const prefix = opts.prefix ? opts.prefix : "";
  const prefixMatchingAggregations = filter(allAggregations, _ =>
    // This filtering is case sensitive, which should fit UI5 XML Views
    // Semantics as the first letter's case designates Class(upper) vs Aggregation(lower)
    _.name.includes(prefix)
  );
  const preExistingSubElementNames = compact(
    uniq(map(parentXMLElement.subElements, _ => _.name))
  );
  const uniquePrefixMatchingAggregations = reject(
    prefixMatchingAggregations,
    _ => includes(preExistingSubElementNames, _.name)
  );
  const suggestions = map(uniquePrefixMatchingAggregations, _ => ({
    ui5Node: _,
    astNode: opts.element
  }));
  return suggestions;
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

  const parentTagFqn = xmlToFQN(opts.parentAstNode);
  const parentUI5Class = opts.model.classes[parentTagFqn];
  // An Aggregation is always directly nested inside a Control.
  if (isControlSubClass(parentUI5Class)) {
    return false;
  }

  return true;
}

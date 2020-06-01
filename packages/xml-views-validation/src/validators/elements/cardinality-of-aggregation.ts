import { filter, sortBy, map, isEmpty, flatMap } from "lodash";
import { XMLElement, XMLToken, SourcePosition } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { getUI5AggregationByXMLElement } from "@ui5-language-assistant/logic-utils";
import { InvalidAggregationCardinalityIssue } from "../../../api";
import {
  getMessage,
  INVALID_AGGREGATION_CARDINALITY,
} from "../../utils/messages";

export function validateExplicitAggregationCardinality(
  xmlElement: XMLElement,
  model: UI5SemanticModel
): InvalidAggregationCardinalityIssue[] {
  const aggregation = getUI5AggregationByXMLElement(xmlElement, model);
  // Is xmlElement an aggregation?
  if (aggregation === undefined || xmlElement.syntax.openName === undefined) {
    return [];
  }

  const allSubElementsAtSameDepth = getAllSubElementsAtSameDepth(xmlElement);
  if (
    allSubElementsAtSameDepth.length <= 1 ||
    aggregation.cardinality === "0..n"
  ) {
    return [];
  }

  const firstCousin = getFirstSubElementAtSameDepth(allSubElementsAtSameDepth);
  // The error will not be shown on the first cousin element
  const redundantAggregationSubElements = filter(
    xmlElement.subElements,
    (_) => !isFirstSubElementAtSameDepth(_, firstCousin)
  );

  const invalidAggregationCardinalityIssues = map(
    redundantAggregationSubElements,
    (_): InvalidAggregationCardinalityIssue => ({
      kind: "InvalidAggregationCardinality",
      message: getMessage(INVALID_AGGREGATION_CARDINALITY, aggregation.name),
      severity: "error",
      offsetRange: {
        start: getSubElementPosition(_).startOffset,
        end: getSubElementPosition(_).endOffset,
      },
    })
  );

  return invalidAggregationCardinalityIssues;
}

function getFirstSubElementAtSameDepth(
  allSubElementsAtSameDepth: XMLElement[]
): XMLElement {
  const sortedSubElementsAtSameDepth = sortBy(allSubElementsAtSameDepth, (_) =>
    getSubElementPosition(_)
  );

  return sortedSubElementsAtSameDepth[0];
}

function isFirstSubElementAtSameDepth(
  subElement: XMLElement,
  firstSubElement: XMLElement
): boolean {
  return (
    getSubElementPosition(subElement).startOffset ===
    getSubElementPosition(firstSubElement).startOffset
  );
}

function getSubElementPosition(
  xmlElement: XMLElement
): XMLToken | SourcePosition {
  return xmlElement.syntax.openName ?? xmlElement.position;
}

/**
 *  @param aggregationElem The aggregation from which we will get all its subElements at the same depth.
 *
 * For example - for the following xml snippet the function will return an array of `Toolbar` elemnt and `tnt:ToolHeader` element
 * ```
 * <headerToolbar>
 *     <Toolbar></Toolbar>
 * </headerToolbar>
 * <headerToolbar>
 *     <tnt:ToolHeader></tnt:ToolHeader>
 * </headerToolbar>
 * ```
 **/
function getAllSubElementsAtSameDepth(
  aggregationElem: XMLElement
): XMLElement[] {
  // We can never reach this case - if it's the root tag, it will never be an aggregation
  /* istanbul ignore next */
  if (aggregationElem.parent.type !== "XMLElement") {
    return [];
  }

  const aggregationParent = aggregationElem.parent;
  const sameNameAggregations = filter(
    aggregationParent.subElements,
    (_) => _.name === aggregationElem.name && !isEmpty(_.subElements)
  );

  const allSubElementsAtSameDepth = flatMap(sameNameAggregations, (_) => {
    return _.subElements;
  });

  return allSubElementsAtSameDepth;
}

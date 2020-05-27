import { filter, forEach, sortBy, map } from "lodash";
import { XMLElement } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { getUI5AggregationByXMLElement } from "@ui5-language-assistant/logic-utils";
import { CardinalityOfAggregationIssue } from "../../../api";

export function validateCardinality(
  xmlElement: XMLElement,
  model: UI5SemanticModel
): CardinalityOfAggregationIssue[] {
  const aggregation = getUI5AggregationByXMLElement(xmlElement, model);
  if (aggregation === undefined || xmlElement.syntax.openName === undefined) {
    return [];
  }

  const allCousinsElements = getAllICousinsElements(xmlElement);
  if (allCousinsElements.length > 1 && aggregation.cardinality === "0..1") {
    const firstCousin = getFirstCousin(allCousinsElements);
    // The error will not be shown on first cousin element
    const currentAggregationSubElements = filter(
      xmlElement.subElements,
      (_) => !isFirstCousin(_, firstCousin)
    );

    const cardinalityOfAggregationIssues = map(
      currentAggregationSubElements,
      (_): CardinalityOfAggregationIssue => ({
        kind: "CardinalityOfAggregation",
        message: `The aggregation '${xmlElement.name}' has cardinality of 0..1 and can only contain one element.`,
        severity: "error",
        offsetRange: {
          start: (_.syntax.openName ?? _.position).startOffset,
          end: (_.syntax.openName ?? _.position).endOffset,
        },
      })
    );

    return cardinalityOfAggregationIssues;
  }

  return [];
}

function getFirstCousin(allCousinsElements: XMLElement[]): XMLElement {
  const sortedCousinsElements = sortBy(
    allCousinsElements,
    (_) => _.syntax.openName ?? _.position
  );

  return sortedCousinsElements[0];
}

function isFirstCousin(
  cousinElement: XMLElement,
  firstCousin: XMLElement
): boolean {
  return (
    (cousinElement.syntax.openName ?? cousinElement.position).startOffset ===
    (firstCousin.syntax.openName ?? firstCousin.position).startOffset
  );
}

/* For example - for the following xml snippet the function will return an array of `Toolbar` elemnt and `tnt:ToolHeader` element
  `<headerToolbar>
      <Toolbar></Toolbar>
  </headerToolbar>
  <headerToolbar>
      <tnt:ToolHeader></tnt:ToolHeader>
  </headerToolbar>`
*/
function getAllICousinsElements(xmlElement: XMLElement): XMLElement[] {
  let allCousinsElements: XMLElement[] = [];
  if (xmlElement.parent.type === "XMLElement") {
    const parent = xmlElement.parent;
    const identicalAggregations = filter(
      parent.subElements,
      (subElement) =>
        subElement.name === xmlElement.name && subElement.subElements.length > 0
    );

    forEach(identicalAggregations, (_) => {
      allCousinsElements = allCousinsElements.concat(_.subElements);
    });
  }

  return allCousinsElements;
}

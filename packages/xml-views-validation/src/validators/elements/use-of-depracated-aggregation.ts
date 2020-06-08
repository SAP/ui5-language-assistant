import { XMLElement } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { getUI5AggregationByXMLElement } from "@ui5-language-assistant/logic-utils";
import { UseOfDeprecatedAggregationIssue } from "../../../api";
import {
  buildDeprecatedIssueMessage,
  DeprecatedUI5Symbol,
} from "../../utils/deprecated-message-builder";

export function validateUseOfDeprecatedAggregation(
  xmlElement: XMLElement,
  model: UI5SemanticModel
): UseOfDeprecatedAggregationIssue[] {
  const aggregation = getUI5AggregationByXMLElement(xmlElement, model);
  if (aggregation === undefined) {
    return [];
  }

  if (
    aggregation.deprecatedInfo !== undefined &&
    // An issue lacking a position is not a useful issue...
    xmlElement.syntax.openName !== undefined
  ) {
    const deprecatedIssue: UseOfDeprecatedAggregationIssue = {
      kind: "UseOfDeprecatedAggregation",
      message: buildDeprecatedIssueMessage({
        symbol: aggregation as DeprecatedUI5Symbol,
        model,
      }),
      severity: "warn",
      offsetRange: {
        start: xmlElement.syntax.openName.startOffset,
        end: xmlElement.syntax.openName.endOffset,
      },
    };
    return [deprecatedIssue];
  }

  return [];
}

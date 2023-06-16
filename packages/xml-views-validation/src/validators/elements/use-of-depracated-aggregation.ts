import { XMLElement } from "@xml-tools/ast";
import { getUI5AggregationByXMLElement } from "@ui5-language-assistant/logic-utils";
import { UseOfDeprecatedAggregationIssue } from "../../../api";
import {
  buildDeprecatedIssueMessage,
  DeprecatedUI5Symbol,
} from "../../utils/deprecated-message-builder";
import { Context } from "@ui5-language-assistant/context";

export function validateUseOfDeprecatedAggregation(
  xmlElement: XMLElement,
  context: Context
): UseOfDeprecatedAggregationIssue[] {
  const aggregation = getUI5AggregationByXMLElement(
    xmlElement,
    context.ui5Model
  );
  if (aggregation === undefined) {
    return [];
  }

  if (
    aggregation.deprecatedInfo !== undefined &&
    // An issue lacking a position is not a useful issue...
    xmlElement.syntax.openName !== undefined
  ) {
    const deprecatedIssue: UseOfDeprecatedAggregationIssue = {
      issueType: "base",
      kind: "UseOfDeprecatedAggregation",
      message: buildDeprecatedIssueMessage({
        symbol: aggregation as DeprecatedUI5Symbol,
        model: context.ui5Model,
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

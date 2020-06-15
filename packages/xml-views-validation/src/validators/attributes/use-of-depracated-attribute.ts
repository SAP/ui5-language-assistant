import { assertNever } from "assert-never";
import { XMLAttribute } from "@xml-tools/ast";
import {
  UI5SemanticModel,
  UI5Prop,
  UI5Event,
  UI5Association,
  UI5Aggregation,
} from "@ui5-language-assistant/semantic-model-types";
import { getUI5NodeByXMLAttribute } from "@ui5-language-assistant/logic-utils";
import {
  UseOfDeprecatedPropertyIssue,
  UseOfDeprecatedEventIssue,
  UseOfDeprecatedAssociationIssue,
  UseOfDeprecatedAggregationIssue,
} from "../../../api";
import {
  buildDeprecatedIssueMessage,
  DeprecatedUI5Symbol,
} from "../../utils/deprecated-message-builder";

type UseOfDeprecatedAttributeIssue =
  | UseOfDeprecatedPropertyIssue
  | UseOfDeprecatedAggregationIssue
  | UseOfDeprecatedEventIssue
  | UseOfDeprecatedAssociationIssue;
type DeprecatedAttributeIssueKind =
  | "UseOfDeprecatedProperty"
  | "UseOfDeprecatedEvent"
  | "UseOfDeprecatedAssociation"
  | "UseOfDeprecatedAggregation";

export function validateUseOfDeprecatedAttribute(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): UseOfDeprecatedAttributeIssue[] {
  if (attribute.syntax.key === undefined || attribute.key === null) {
    // Can't give an error without a position or key name
    return [];
  }

  const ui5Node = getUI5NodeByXMLAttribute(attribute, model);

  if (ui5Node === undefined || ui5Node.deprecatedInfo === undefined) {
    return [];
  }

  const deprecatedIssue: UseOfDeprecatedAttributeIssue = {
    kind: getDeprecatedAttributeIssueKind(ui5Node),
    message: buildDeprecatedIssueMessage({
      symbol: ui5Node as DeprecatedUI5Symbol,
      model,
    }),
    severity: "warn",
    offsetRange: {
      start: attribute.syntax.key.startOffset,
      end: attribute.syntax.key.endOffset,
    },
  };

  return [deprecatedIssue];
}

function getDeprecatedAttributeIssueKind(
  ui5Node: UI5Prop | UI5Event | UI5Association | UI5Aggregation
): DeprecatedAttributeIssueKind {
  const ui5NodeKind = ui5Node.kind;
  switch (ui5NodeKind) {
    case "UI5Prop":
      return "UseOfDeprecatedProperty";
    case "UI5Event":
      return "UseOfDeprecatedEvent";
    case "UI5Association":
      return "UseOfDeprecatedAssociation";
    case "UI5Aggregation":
      return "UseOfDeprecatedAggregation";
    /* istanbul ignore next - defensive programming */
    default:
      assertNever(ui5NodeKind);
  }
}

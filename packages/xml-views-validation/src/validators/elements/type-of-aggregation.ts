import { XMLElement } from "@xml-tools/ast";
import {
  UI5SemanticModel,
  UI5Interface,
  UI5Class,
  UI5Type,
} from "@ui5-language-assistant/semantic-model-types";
import {
  getUI5ClassByXMLElement,
  getUI5AggregationByXMLElement,
  classIsOfType,
} from "@ui5-language-assistant/logic-utils";
import { InvalidAggregationTypeIssue } from "api";
import { INVALID_AGGREGATION_TYPE, getMessage } from "../../utils/messages";

export function validateAggregationType(
  xmlElement: XMLElement,
  model: UI5SemanticModel
): InvalidAggregationTypeIssue[] {
  const ui5class = getUI5ClassByXMLElement(xmlElement, model);
  const aggregationType = getAggregationTypeByXMLElement(xmlElement, model);
  if (ui5class !== undefined && aggregationType !== undefined) {
    return getInvalidAggregationTypeIssue(
      xmlElement,
      ui5class,
      aggregationType
    );
  }

  return [];
}

function getInvalidAggregationTypeIssue(
  xmlElement: XMLElement,
  ui5Class: UI5Class,
  aggregationType: UI5Class | UI5Interface
): InvalidAggregationTypeIssue[] {
  const isTypeOf = classIsOfType(ui5Class, aggregationType);
  if (!isTypeOf && xmlElement.syntax.openName !== undefined) {
    const invalidAggregationTypeIssue: InvalidAggregationTypeIssue = {
      kind: "InvalidAggregationType",
      message: getMessage(
        INVALID_AGGREGATION_TYPE,
        ui5Class.name,
        aggregationType.name
      ),
      severity: "error",
      offsetRange: {
        start: xmlElement.syntax.openName.startOffset,
        end: xmlElement.syntax.openName.endOffset,
      },
    };
    return [invalidAggregationTypeIssue];
  }

  return [];
}

function getValidAggregationType(
  aggregationType: UI5Type | undefined
): UI5Class | UI5Interface | undefined {
  if (aggregationType === undefined) {
    return undefined;
  }

  switch (aggregationType.kind) {
    case "UI5Class":
      return aggregationType as UI5Class;
    case "UI5Interface":
      return aggregationType as UI5Interface;
    default:
      return undefined;
  }
}

function getAggregationTypeByXMLElement(
  xmlElement: XMLElement,
  model: UI5SemanticModel
): UI5Class | UI5Interface | undefined {
  if (xmlElement.parent.type !== "XMLElement") {
    return undefined;
  }

  const aggregationParent = getUI5AggregationByXMLElement(
    xmlElement.parent,
    model
  );
  if (aggregationParent !== undefined) {
    return getValidAggregationType(aggregationParent.type);
  }

  const classParent = getUI5ClassByXMLElement(xmlElement.parent, model);
  return classParent
    ? getValidAggregationType(classParent.defaultAggregation?.type)
    : undefined;
}

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
import { InvalidAggregationTypeIssue } from "../../../api";
import { INVALID_AGGREGATION_TYPE, getMessage } from "../../utils/messages";

export function validateAggregationType(
  xmlElement: XMLElement,
  model: UI5SemanticModel
): InvalidAggregationTypeIssue[] {
  const ui5class = getUI5ClassByXMLElement(xmlElement, model);
  // Root element can never be inside aggregation
  if (xmlElement.parent.type === "XMLDocument") {
    return [];
  }

  const allowedTypeInAggregation = getAllowedTypeForSubNodesByXMLElement(
    xmlElement.parent,
    model
  );
  if (ui5class !== undefined && allowedTypeInAggregation !== undefined) {
    return getInvalidAggregationTypeIssue(
      xmlElement,
      ui5class,
      allowedTypeInAggregation
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
  /* istanbul ignore if */
  if (aggregationType === undefined) {
    return undefined;
  }

  switch (aggregationType.kind) {
    case "UI5Class":
      return aggregationType as UI5Class;
    case "UI5Interface":
      return aggregationType as UI5Interface;
    /* istanbul ignore next - we can only recieve aggregation type of 'UI5Class' or 'UI5Interface' */
    default:
      return undefined;
  }
}

function getAllowedTypeForSubNodesByXMLElement(
  xmlElement: XMLElement,
  model: UI5SemanticModel
): UI5Class | UI5Interface | undefined {
  const aggregation = getUI5AggregationByXMLElement(xmlElement, model);

  // Case of explicit aggregation
  if (aggregation !== undefined) {
    return getValidAggregationType(aggregation.type);
  }

  // Case of possible default aggregation
  const ui5class = getUI5ClassByXMLElement(xmlElement, model);
  /* istanbul ignore if */
  if (ui5class === undefined || ui5class.defaultAggregation === undefined) {
    return undefined;
  }

  return getValidAggregationType(ui5class.defaultAggregation.type);
}

import { includes } from "lodash";
import { XMLElement } from "@xml-tools/ast";
import {
  UI5SemanticModel,
  UI5Interface,
  UI5Class,
  UI5Aggregation,
} from "@ui5-language-assistant/semantic-model-types";
import {
  getUI5ClassByXMLElement,
  getUI5AggregationByXMLElement,
  classIsOfType,
  ui5NodeToFQN,
} from "@ui5-language-assistant/logic-utils";
import {
  validations,
  buildMessage,
} from "@ui5-language-assistant/user-facing-text";
import { InvalidAggregationTypeIssue } from "../../../api";

const { INVALID_AGGREGATION_TYPE } = validations;

export function validateAggregationType(
  xmlElement: XMLElement,
  model: UI5SemanticModel
): InvalidAggregationTypeIssue[] {
  // Root element can never be inside aggregation
  if (xmlElement.parent.type === "XMLDocument") {
    return [];
  }

  const ui5class = getUI5ClassByXMLElement(xmlElement, model);
  const parentAggregation = getAggregationByXMLElement(
    xmlElement.parent,
    model
  );

  if (ui5class === undefined || parentAggregation === undefined) {
    return [];
  }

  if (isAllowedListedClass(ui5class)) {
    return [];
  }

  const allowedTypeInAggregation = getValidAggregationTypeForSubNodes(
    parentAggregation
  );

  if (allowedTypeInAggregation === undefined) {
    return [];
  }

  const invalidAggregationTypeIssue = getInvalidAggregationTypeIssue({
    xmlElement,
    ui5Class: ui5class,
    aggregationName: parentAggregation.name,
    aggregationType: allowedTypeInAggregation,
  });

  return invalidAggregationTypeIssue;
}

const allowedListedNamespaces = [
  // A `Fragment` "inlines" source code from a `FragmentDefinition`
  // We are not (currently) aware of the contents being inlined
  // and instead skip in this case to avoid false positives.
  "sap.ui.core.Fragment",
];

function isAllowedListedClass(ui5Class: UI5Class): boolean {
  const classFqn = ui5NodeToFQN(ui5Class);
  return includes(allowedListedNamespaces, classFqn);
}

function getInvalidAggregationTypeIssue({
  xmlElement,
  ui5Class,
  aggregationName,
  aggregationType,
}: {
  xmlElement: XMLElement;
  ui5Class: UI5Class;
  aggregationName: string;
  aggregationType: UI5Class | UI5Interface;
}): InvalidAggregationTypeIssue[] {
  const isTypeOf = classIsOfType(ui5Class, aggregationType);
  if (!isTypeOf && xmlElement.syntax.openName !== undefined) {
    const invalidAggregationTypeIssue: InvalidAggregationTypeIssue = {
      kind: "InvalidAggregationType",
      message: buildMessage(
        INVALID_AGGREGATION_TYPE.msg,
        ui5Class.name,
        aggregationName,
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

function getValidAggregationTypeForSubNodes(
  aggregation: UI5Aggregation
): UI5Class | UI5Interface | undefined {
  const aggregationType = aggregation.type;
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

function getAggregationByXMLElement(
  xmlElement: XMLElement,
  model: UI5SemanticModel
): UI5Aggregation | undefined {
  const aggregation = getUI5AggregationByXMLElement(xmlElement, model);

  // Case of explicit aggregation
  if (aggregation !== undefined) {
    return aggregation;
  }

  // Case of possible default aggregation
  const ui5class = getUI5ClassByXMLElement(xmlElement, model);
  if (ui5class !== undefined && ui5class.defaultAggregation !== undefined) {
    return ui5class.defaultAggregation;
  }

  return undefined;
}

import { XMLAttribute, XMLElement, DEFAULT_NS } from "@xml-tools/ast";
import { isXMLNamespaceKey } from "@xml-tools/common";
import {
  XMLElementOpenName,
  XMLElementCloseName,
  XMLAttributeKey,
  XMLAttributeValue,
} from "@xml-tools/ast-position";
import { find } from "lodash";
import {
  xmlToFQN,
  ui5NodeToFQN,
  flattenAggregations,
  getUI5ClassByXMLElement,
  getUI5PropertyByXMLAttributeKey,
} from "@ui5-language-assistant/logic-utils";
import {
  UI5Class,
  UI5Aggregation,
  UI5SemanticModel,
  UI5EnumValue,
  UI5Enum,
  BaseUI5Node,
} from "@ui5-language-assistant/semantic-model-types";
import { findSymbol } from "@ui5-language-assistant/semantic-model";

export function findUI5HoverNodeAtOffset(
  visitor:
    | XMLElementOpenName
    | XMLElementCloseName
    | XMLAttributeKey
    | XMLAttributeValue
    | undefined,
  model: UI5SemanticModel
): BaseUI5Node | undefined {
  if (visitor === undefined) {
    return undefined;
  }
  switch (visitor.kind) {
    case "XMLElementOpenName":
      return getUI5NodeByElement(visitor.astNode, model, visitor.kind);
    case "XMLElementCloseName":
      return getUI5NodeByElement(visitor.astNode, model, visitor.kind);
    case "XMLAttributeKey":
      return getUI5PropertyByXMLAttributeKey(visitor.astNode, model);
    case "XMLAttributeValue":
      return findUI5NodeByXMLAttributeValue(visitor.astNode, model);
  }
}

function getUI5NodeByElement(
  astNode: XMLElement,
  model: UI5SemanticModel,
  kind: string
): UI5Class | UI5Aggregation | undefined {
  const fqnClassName =
    kind === "XMLElementOpenName"
      ? xmlToFQN(astNode)
      : elementClosingTagToFQN(astNode);
  const ui5Class = find(
    model.classes,
    (ui5class) => fqnClassName === ui5NodeToFQN(ui5class)
  );

  if (astNode.parent.type === "XMLDocument" || ui5Class != undefined) {
    return ui5Class;
  }

  const parentElementClass = getUI5ClassByXMLElement(astNode.parent, model);
  const nameByKind =
    kind === "XMLElementOpenName"
      ? astNode.syntax.openName?.image
      : astNode.syntax.closeName?.image;
  return findAggragationByName(parentElementClass, nameByKind);
}

function findAggragationByName(
  ui5Class: UI5Class | undefined,
  targetName: string | undefined
): UI5Aggregation | undefined {
  if (ui5Class != undefined) {
    const allAggregations: UI5Aggregation[] = flattenAggregations(ui5Class);
    const ui5Aggregation = find(
      allAggregations,
      (aggregation) => aggregation.name === targetName
    );

    return ui5Aggregation;
  }

  return undefined;
}

function elementClosingTagToFQN(astElement: XMLElement): string {
  const baseName = astElement.syntax.closeName?.image
    ? astElement.syntax.closeName?.image
    : "";
  const prefixXmlns = astElement.ns ? astElement.ns : DEFAULT_NS;
  const resolvedXmlns = astElement.namespaces[prefixXmlns];

  if (resolvedXmlns !== undefined) {
    return resolvedXmlns + "." + baseName;
  }

  return baseName;
}

function findUI5NodeByXMLAttributeValue(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): BaseUI5Node | undefined {
  if (
    attribute.key !== null &&
    attribute.value !== null &&
    isXMLNamespaceKey({ key: attribute.key, includeEmptyPrefix: true })
  ) {
    const ui5Node = findSymbol(model, attribute.value);
    return ui5Node;
  }

  return getUI5EnumByElement(attribute, model);
}

function getUI5EnumByElement(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): UI5EnumValue | undefined {
  const enumProp = getEnumProperty(attribute, model);
  const enumValue = find(enumProp?.fields, ["name", attribute.value]);

  return enumValue;
}

function getEnumProperty(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): UI5Enum | undefined {
  const ui5Prop = getUI5PropertyByXMLAttributeKey(attribute, model);
  return ui5Prop?.type?.kind === "UI5Enum" ? ui5Prop.type : undefined;
}

import { find } from "lodash";
import { assertNever } from "assert-never";
import { XMLAttribute, XMLElement, DEFAULT_NS } from "@xml-tools/ast";
import { isXMLNamespaceKey } from "@xml-tools/common";
import {
  XMLElementOpenName,
  XMLElementCloseName,
  XMLAttributeKey,
  XMLAttributeValue,
} from "@xml-tools/ast-position";
import {
  xmlToFQN,
  flattenAggregations,
  getUI5ClassByXMLElement,
  getUI5PropertyByXMLAttributeKey,
  flattenProperties,
  flattenEvents,
  flattenAssociations,
  splitQNameByNamespace,
} from "@ui5-language-assistant/logic-utils";
import {
  UI5Class,
  UI5Aggregation,
  UI5SemanticModel,
  UI5EnumValue,
  UI5Enum,
  BaseUI5Node,
  UI5Prop,
  UI5Event,
  UI5Association,
} from "@ui5-language-assistant/semantic-model-types";
import { findSymbol } from "@ui5-language-assistant/semantic-model";

export function findUI5HoverNodeAtOffset(
  astPosition:
    | XMLElementOpenName
    | XMLElementCloseName
    | XMLAttributeKey
    | XMLAttributeValue,
  model: UI5SemanticModel
): BaseUI5Node | undefined {
  switch (astPosition.kind) {
    case "XMLElementOpenName":
      return findUI5NodeByElement(astPosition.astNode, model, true);
    case "XMLElementCloseName":
      return findUI5NodeByElement(astPosition.astNode, model, false);
    case "XMLAttributeKey":
      return findUI5NodeByXMLAttributeKey(astPosition.astNode, model);
    case "XMLAttributeValue":
      return findUI5NodeByXMLAttributeValue(astPosition.astNode, model);
    /* istanbul ignore next - defensive programming */
    default:
      assertNever(astPosition);
  }
}

function findUI5NodeByElement(
  astNode: XMLElement,
  model: UI5SemanticModel,
  isOpenName: boolean
): UI5Class | UI5Aggregation | undefined {
  const fqnClassName = isOpenName
    ? xmlToFQN(astNode)
    : elementClosingTagToFQN(astNode);

  const ui5Class = model.classes[fqnClassName];
  if (astNode.parent.type === "XMLDocument" || ui5Class !== undefined) {
    return ui5Class;
  }

  const parentElementClass = getUI5ClassByXMLElement(astNode.parent, model);
  if (parentElementClass === undefined) {
    return undefined;
  }

  // openName or closeName cannot be undefined here because otherwise the ast position visitor wouldn't return their types
  const tagQName = isOpenName
    ? /* istanbul ignore next */
      astNode.syntax.openName?.image
    : /* istanbul ignore next */
      astNode.syntax.closeName?.image;
  /* istanbul ignore if */
  if (tagQName === undefined) {
    return undefined;
  }

  // Aggregations must be in the same namespace as their parent
  // https://sapui5.hana.ondemand.com/#/topic/19eabf5b13214f27b929b9473df3195b
  const { prefix, localName } = splitQNameByNamespace(tagQName);
  if (prefix !== astNode.parent.ns) {
    return undefined;
  }

  return findAggragationByName(parentElementClass, localName);
}

function findAggragationByName(
  ui5Class: UI5Class,
  targetName: string
): UI5Aggregation | undefined {
  const allAggregations: UI5Aggregation[] = flattenAggregations(ui5Class);
  const ui5Aggregation = find(
    allAggregations,
    (aggregation) => aggregation.name === targetName
  );

  return ui5Aggregation;
}

function elementClosingTagToFQN(xmlElement: XMLElement): string {
  //the closeName can't be undefined here because otherwise the ast position visitor wouldn't return its type
  /* istanbul ignore next */
  const qName = xmlElement.syntax.closeName?.image ?? "";
  const { prefix, localName } = splitQNameByNamespace(qName);
  const prefixXmlns = prefix ?? DEFAULT_NS;
  const resolvedXmlns = xmlElement.namespaces[prefixXmlns];

  if (resolvedXmlns !== undefined) {
    return resolvedXmlns + "." + localName;
  }

  return localName;
}

function findUI5NodeByXMLAttributeKey(
  astNode: XMLAttribute,
  model: UI5SemanticModel
): UI5Prop | UI5Event | UI5Association | UI5Aggregation | undefined {
  const parentElementClass = getUI5ClassByXMLElement(astNode.parent, model);
  return parentElementClass
    ? findUI5ClassMemberByName(parentElementClass, astNode.key)
    : undefined;
}

function findUI5ClassMemberByName(
  ui5Class: UI5Class,
  targetName: string | null
): UI5Prop | UI5Event | UI5Association | UI5Aggregation | undefined {
  const allProps: (
    | UI5Prop
    | UI5Event
    | UI5Association
    | UI5Aggregation
  )[] = flattenProperties(ui5Class);
  const allEvents = flattenEvents(ui5Class);
  const allAssociations = flattenAssociations(ui5Class);
  const allAggregations = flattenAggregations(ui5Class);
  const allClassMembers = allProps
    .concat(allEvents)
    .concat(allAssociations)
    .concat(allAggregations);
  const found = find(allClassMembers, (_) => _.name === targetName);
  return found;
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
  if (enumProp !== undefined) {
    const enumValue = find(enumProp.fields, ["name", attribute.value]);
    return enumValue;
  }

  return undefined;
}

function getEnumProperty(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): UI5Enum | undefined {
  const ui5Prop = getUI5PropertyByXMLAttributeKey(attribute, model);
  return ui5Prop?.type?.kind === "UI5Enum" ? ui5Prop.type : undefined;
}

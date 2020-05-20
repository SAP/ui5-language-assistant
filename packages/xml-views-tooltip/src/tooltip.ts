import { find, includes } from "lodash";
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
  ui5NodeToFQN,
  flattenAggregations,
  getUI5ClassByXMLElement,
  getUI5PropertyByXMLAttributeKey,
  flattenProperties,
  flattenEvents,
  flattenAssociations,
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
  if (astPosition === undefined) {
    return undefined;
  }
  switch (astPosition.kind) {
    case "XMLElementOpenName":
      return findUI5NodeByElement(astPosition.astNode, model, true);
    case "XMLElementCloseName":
      return findUI5NodeByElement(astPosition.astNode, model, false);
    case "XMLAttributeKey":
      return findUI5NodeByXMLAttributeKey(astPosition.astNode, model);
    case "XMLAttributeValue":
      return findUI5NodeByXMLAttributeValue(astPosition.astNode, model);
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
  const nameByKind = isOpenName
    ? astNode.syntax.openName?.image
    : astNode.syntax.closeName?.image;

  return nameByKind !== undefined
    ? findAggragationByName(parentElementClass, nameByKind)
    : undefined;
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

function splitQNameByNamespace(
  qName: string
): { ns: string | undefined; name: string } {
  if (!includes(qName, ":")) {
    return { name: qName, ns: undefined };
  }
  const match = qName.match(/(?<ns>[^:]*)(:(?<name>.*))?/);
  // There will always be a match because the attribute key always contains a colon at this point
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const matchGroups = match!.groups!;
  return {
    ns: matchGroups.ns,
    name: matchGroups.name ?? "",
  };
}

function elementClosingTagToFQN(xmlElement: XMLElement): string {
  const qName = xmlElement.syntax.closeName?.image ?? "";
  const { ns, name } = splitQNameByNamespace(qName);
  const prefixXmlns = ns ?? DEFAULT_NS;
  const resolvedXmlns = xmlElement.namespaces[prefixXmlns];

  if (resolvedXmlns !== undefined) {
    return resolvedXmlns + "." + name;
  }

  return name;
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

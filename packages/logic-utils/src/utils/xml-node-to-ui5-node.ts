import {
  xmlToFQN,
  xmlClosingTagToFQN,
  flattenProperties,
  flattenAggregations,
  isSameXMLNS,
  resolveXMLNS,
  splitQNameByNamespace,
  flattenEvents,
  flattenAssociations,
} from "@ui5-language-assistant/logic-utils";
import { XMLElement, XMLAttribute } from "@xml-tools/ast";
import {
  UI5Class,
  UI5SemanticModel,
  UI5Prop,
  UI5Aggregation,
  BaseUI5Node,
  UI5Event,
  UI5Association,
} from "@ui5-language-assistant/semantic-model-types";
import { find } from "lodash";
import { findSymbol } from "@ui5-language-assistant/semantic-model";

export function getUI5ClassByXMLElement(
  element: XMLElement,
  model: UI5SemanticModel
): UI5Class | undefined {
  const elementTagFqn = xmlToFQN(element);
  const ui5Class = model.classes[elementTagFqn];
  // The class name might not be the same as the element name in case the element name contained a dot
  // (example: using core:mvc.View instead of mvc:View), which is not allowed.
  if (ui5Class === undefined || ui5Class.name !== element.name) {
    return undefined;
  }
  return ui5Class;
}

export function getUI5ClassByXMLElementClosingTag(
  element: XMLElement,
  model: UI5SemanticModel
): UI5Class | undefined {
  // Nameless closing tag cannot be a class
  if (element.syntax.closeName === undefined) {
    return undefined;
  }
  const closingTagName = splitQNameByNamespace(element.syntax.closeName.image)
    .localName;
  const elementTagFqn = xmlClosingTagToFQN(element);
  const ui5Class = model.classes[elementTagFqn];
  // The class name might not be the same as the element name in case the element name contained a dot
  // (example: using core:mvc.View instead of mvc:View), which is not allowed.
  if (ui5Class === undefined || ui5Class.name !== closingTagName) {
    return undefined;
  }
  return ui5Class;
}

export function getUI5AggregationByXMLElement(
  element: XMLElement,
  model: UI5SemanticModel
): UI5Aggregation | undefined {
  // Aggregations can only be under classes
  if (element.parent.type === "XMLDocument") {
    return undefined;
  }
  // Aggregations must be in the same namespace as their parent
  // https://sapui5.hana.ondemand.com/#/topic/19eabf5b13214f27b929b9473df3195b
  if (!isSameXMLNS(element, element.parent)) {
    return undefined;
  }
  const ui5Class = getUI5ClassByXMLElement(element.parent, model);
  if (ui5Class === undefined) {
    return undefined;
  }
  const aggregations = flattenAggregations(ui5Class);
  const elementAggregation = find(aggregations, ["name", element.name]);
  return elementAggregation;
}

export function getUI5PropertyByXMLAttributeKey(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): UI5Prop | undefined {
  const xmlElement = attribute.parent;
  const elementClass = getUI5ClassByXMLElement(xmlElement, model);
  if (elementClass === undefined) {
    return undefined;
  }
  const properties = flattenProperties(elementClass);
  const ui5Property = find(properties, ["name", attribute.key]);
  return ui5Property;
}

export function getUI5NodeByXMLAttributeKey(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): UI5Prop | UI5Event | UI5Association | UI5Aggregation | undefined {
  const parentElementClass = getUI5ClassByXMLElement(attribute.parent, model);
  return parentElementClass
    ? findUI5ClassMemberByName(parentElementClass, attribute.key)
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

export function getUI5NodeFromXMLElementNamespace(
  xmlElement: XMLElement,
  model: UI5SemanticModel
): {
  namespace: BaseUI5Node | undefined;
  isDefault: boolean;
  isXmlnsDefined: boolean;
} {
  const isDefault = xmlElement.ns === undefined;
  const xmlNamespace = resolveXMLNS(xmlElement);
  if (xmlNamespace === undefined) {
    return {
      namespace: undefined,
      isDefault: isDefault,
      isXmlnsDefined: false,
    };
  }

  const ui5Namespace = findSymbol(model, xmlNamespace);
  return {
    namespace: ui5Namespace,
    isDefault: isDefault,
    isXmlnsDefined: true,
  };
}

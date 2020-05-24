import {
  xmlToFQN,
  flattenProperties,
  flattenAggregations,
} from "@ui5-language-assistant/logic-utils";
import { XMLElement, XMLAttribute, DEFAULT_NS } from "@xml-tools/ast";
import {
  UI5Class,
  UI5SemanticModel,
  UI5Prop,
  UI5Aggregation,
  UI5Namespace,
} from "@ui5-language-assistant/semantic-model-types";
import { find } from "lodash";

export function getUI5ClassByXMLElement(
  element: XMLElement,
  model: UI5SemanticModel
): UI5Class | undefined {
  const elementTagFqn = xmlToFQN(element);
  return model.classes[elementTagFqn];
}

export function getUI5AggregationByXMLElement(
  element: XMLElement,
  model: UI5SemanticModel
): UI5Aggregation | undefined {
  // Aggregations can only be under classes
  if (element.parent.type === "XMLDocument") {
    return undefined;
  }
  // Aggregations don't have a namespace
  if (element.ns !== undefined) {
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

export function getUI5NodeFromXMLElementNamespace(
  xmlElement: XMLElement,
  model: UI5SemanticModel
): {
  namespace: UI5Namespace | undefined;
  isDefault: boolean;
  isXmlnsDefined: boolean;
} {
  const isDefault = xmlElement.ns === undefined;
  const xmlnsFQN = xmlElement.namespaces[xmlElement.ns ?? DEFAULT_NS];
  if (xmlnsFQN === undefined) {
    return {
      namespace: undefined,
      isDefault: isDefault,
      isXmlnsDefined: false,
    };
  }

  const ui5Namespace = model.namespaces[xmlnsFQN];
  return {
    namespace: ui5Namespace,
    isDefault: isDefault,
    isXmlnsDefined: true,
  };
}

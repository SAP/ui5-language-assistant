import {
  xmlToFQN,
  flattenProperties,
} from "@ui5-language-assistant/logic-utils";
import { XMLElement, XMLAttribute } from "@xml-tools/ast";
import {
  UI5Class,
  UI5SemanticModel,
  UI5Prop,
} from "@ui5-language-assistant/semantic-model-types";
import { find } from "lodash";

export function getClassByElement(
  element: XMLElement,
  model: UI5SemanticModel
): UI5Class | undefined {
  const elementTagFqn = xmlToFQN(element);
  return model.classes[elementTagFqn];
}

export function getPropertyByAttributeKey(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): UI5Prop | undefined {
  const xmlElement = attribute.parent;
  const elementClass = getClassByElement(xmlElement, model);
  if (elementClass === undefined) {
    return undefined;
  }
  const properties = flattenProperties(elementClass);
  const ui5Property = find(properties, ["name", attribute.key]);
  return ui5Property;
}

import { map, find, filter, values } from "lodash";
import { XMLAttribute } from "@xml-tools/ast";
import {
  isElementSubClass,
  ui5NodeToFQN,
} from "@ui5-language-assistant/logic-utils";
import { getXMLNamespaceKeyPrefix } from "@xml-tools/common";
import { UI5AttributeValueCompletionOptions } from "./index";
import { UI5NamespacesInXMLAttributeValueCompletion } from "../../../api";

/**
 * Suggests namespace value for namespace attribute
 * In case value's prefix ends with dot we'll use the mode of exploration and provide
 * only next level values of namespaces starting with the prefix
 * In other cases we'll provide all values containing the prefix
 **/
export function namespaceValueSuggestions(
  opts: UI5AttributeValueCompletionOptions
): UI5NamespacesInXMLAttributeValueCompletion[] {
  const xmlAttribute = opts.attribute;
  const xmlAttributeName = xmlAttribute.key;

  if (xmlAttributeName === null) {
    return [];
  }

  const xmlnsPrefix = getXMLNamespaceKeyPrefix(xmlAttributeName);
  if (xmlnsPrefix === undefined) {
    return [];
  }

  const ui5Model = opts.context;

  const attributeValue = opts.prefix ?? "";

  let applicableNamespaces = values(ui5Model.namespaces);

  if (attributeValue !== "") {
    applicableNamespaces = filter(applicableNamespaces, (_) =>
      ui5NodeToFQN(_).includes(attributeValue)
    );
  }

  if (attributeValue.endsWith(".")) {
    const applicableNamespacesForExploration = filter(
      applicableNamespaces,
      (_) => ui5NodeToFQN(_).startsWith(attributeValue)
    );
    if (applicableNamespacesForExploration.length > 0) {
      applicableNamespaces = applicableNamespacesForExploration;
    }
  }

  if (xmlnsPrefix !== "") {
    const applicableNamespacesWithPrefix = filter(
      applicableNamespaces,
      (_) => _.name === xmlnsPrefix
    );
    if (applicableNamespacesWithPrefix.length > 0) {
      applicableNamespaces = applicableNamespacesWithPrefix;
    }
  }

  applicableNamespaces = filter(
    applicableNamespaces,
    (_) => find(_.classes, isElementSubClass) !== undefined
  );

  return map(applicableNamespaces, (_) => ({
    type: "UI5NamespacesInXMLAttributeValue",
    ui5Node: _,
    astNode: opts.attribute as XMLAttribute,
  }));
}

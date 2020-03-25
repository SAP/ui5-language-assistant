import { map, find, filter, values } from "lodash";
import { XMLAttribute } from "@xml-tools/ast";
import { isElementSubClass, ui5NodeToFQN } from "@ui5-editor-tools/logic-utils";
import { getClassByElement } from "../utils/filter-members";
import { UI5AttributeValueCompletionOptions } from "./index";
import { UI5NamespacesInXMLAttributeValueCompletion } from "../../../api";
import { getUI5NamespaceLastName } from "../utils/ui5-ns-lastname";
import {
  getXMLNamespaceKeyPrefix,
  isXMLNamespaceKey
} from "../utils/xml-ns-key";

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

  if (xmlAttribute.key === null) {
    return [];
  }

  const xmlAttributeName = xmlAttribute.key;
  const ui5Model = opts.context;
  const xmlElement = opts.element;

  const attributeValue = xmlAttribute.value ?? "";

  const ui5Class = getClassByElement(xmlElement, ui5Model);
  if (ui5Class === undefined || !isXMLNamespaceKey(xmlAttributeName)) {
    return [];
  }

  const ui5ClassFQN = ui5NodeToFQN(ui5Class);

  // we limit usage of namespaces attributes on "sap.ui.core.mvc.View" XML Element
  if (ui5ClassFQN !== "sap.ui.core.mvc.View") {
    return [];
  }

  let applicableNamespaces = filter(
    values(ui5Model.namespaces),
    _ => find(_.classes, isElementSubClass) !== undefined
  );

  const xmlnsPrefix = getXMLNamespaceKeyPrefix(xmlAttributeName);

  if (attributeValue !== "") {
    applicableNamespaces = filter(applicableNamespaces, _ =>
      ui5NodeToFQN(_).includes(attributeValue)
    );
  }

  if (xmlnsPrefix !== "") {
    const applicableNamespacesWithPrefix = filter(
      applicableNamespaces,
      _ => getUI5NamespaceLastName(_) === xmlnsPrefix
    );
    if (applicableNamespacesWithPrefix.length > 0) {
      applicableNamespaces = applicableNamespacesWithPrefix;
    }
  }

  if (attributeValue.endsWith(".")) {
    applicableNamespaces = filter(applicableNamespaces, _ =>
      ui5NodeToFQN(_).startsWith(attributeValue)
    );
  }

  return map(applicableNamespaces, _ => ({
    type: "UI5NamespacesInXMLAttributeValue",
    ui5Node: _,
    astNode: opts.attribute as XMLAttribute
  }));
}

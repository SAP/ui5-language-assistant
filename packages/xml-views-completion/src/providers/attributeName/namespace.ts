import { compact, filter, find, includes, map, reject } from "lodash";
import { UI5Namespace } from "@ui5-editor-tools/semantic-model-types";
import { isElementSubClass, ui5NodeToFQN } from "@ui5-editor-tools/logic-utils";
import { XMLAttribute } from "@xml-tools/ast";
import { UI5AttributeNameCompletionOptions } from "./index";
import { UI5NamespacesInXMLAttributeKeyCompletion } from "../../../api";
import { getClassByElement } from "../utils/filter-members";
import {
  getXMLNamespaceKeyPrefix,
  isXMLNamespaceKey
} from "../utils/xml-ns-key";

/**
 * Suggests Namespaces inside Element
 * For example xmlns:m should provide list of namespaces ending with .m.. (like "sap.m", "sap.ui.core.mvc")
 * attribute is namespace attribute if it's equal to "xmlns" or starts with "xmlns:"
 * in first case all possible namespaces of semantic module will be provided excluding pre-existing ones
 */
export function namespaceKeysSuggestions(
  opts: UI5AttributeNameCompletionOptions
): UI5NamespacesInXMLAttributeKeyCompletion[] {
  const ui5Model = opts.context;
  const xmlElement = opts.element;

  const ui5Clazz = getClassByElement(xmlElement, ui5Model);
  if (ui5Clazz === undefined) {
    return [];
  }

  if (opts.prefix === undefined || !isXMLNamespaceKey(opts.prefix)) {
    return [];
  }

  const existingNamespacesAttributes: XMLAttribute[] = filter(
    xmlElement.attributes,
    isExistingNamespaceAttribute
  );

  const existingNamespacesNames = compact(
    map(existingNamespacesAttributes, _ => _.value)
  );

  const xmlnsPrefix = getXMLNamespaceKeyPrefix(opts.prefix);

  const applicableNamespaces = filter(ui5Model.namespaces, _ =>
    isNamespaceApplicable(_, xmlnsPrefix)
  );

  const suggestedNamespaces = reject(applicableNamespaces, _ =>
    includes(existingNamespacesNames, ui5NodeToFQN(_))
  );

  return map(suggestedNamespaces, _ => ({
    type: "UI5NamespacesInXMLAttributeKey",
    ui5Node: _,
    astNode: opts.attribute as XMLAttribute
  }));
}

export function isExistingNamespaceAttribute(attribute: XMLAttribute): boolean {
  if (typeof attribute.key !== "string") {
    return false;
  }

  if (!isXMLNamespaceKey(attribute.key)) {
    return false;
  }

  if (typeof attribute.value !== "string") {
    return false;
  }

  return attribute.value !== "";
}

function isNamespaceApplicable(
  namespace: UI5Namespace,
  prefix: string
): boolean {
  const smallName = namespace.name;
  if (!smallName.startsWith(prefix)) {
    return false;
  }
  return find(namespace.classes, isElementSubClass) !== undefined;
}

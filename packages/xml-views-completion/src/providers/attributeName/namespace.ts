import { compact, filter, find, includes, last, map, reject } from "lodash";
import { UI5Namespace } from "@ui5-editor-tools/semantic-model-types";
import { isElementSubClass, ui5NodeToFQN } from "@ui5-editor-tools/logic-utils";
import { XMLAttribute } from "@xml-tools/ast";
import { UI5AttributeNameCompletionOptions } from "./index";
import { UI5NamespacesInXMLAttributeKeyCompletion } from "../../../api";
import { getClassByElement } from "../utils/filter-members";

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
  const ui5ClassFQN = ui5NodeToFQN(ui5Clazz);
  // we limit usage of namespaces attributes on "sap.ui.core.mvc.View" XML Element
  if (ui5ClassFQN !== "sap.ui.core.mvc.View") {
    return [];
  }

  if (opts.prefix === undefined || !isNamespaceKey(opts.prefix)) {
    return [];
  }

  const existingNamespacesAttributes: XMLAttribute[] = filter(
    xmlElement.attributes,
    isExistingNamespaceAttribute
  );

  const existingNamespacesNames = compact(
    map(existingNamespacesAttributes, _ => _.value)
  );

  const xmlnsPrefix = getNamespaceKeyPrefix(opts.prefix);

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

  if (!isNamespaceKey(attribute.key)) {
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
  const namespaceFQN = ui5NodeToFQN(namespace);
  const namespaceFQNSplit = namespaceFQN.split(".");
  const smallName = last(namespaceFQNSplit);
  if (smallName === undefined || !smallName.startsWith(prefix)) {
    return false;
  }
  return find(namespace.classes, isElementSubClass) !== undefined;
}

//we are only allowing word (\w+) characters in prefixes now (in completions)
//TODO it should be aligned with the full XML spec
const namespaceRegex = /^xmlns(:(?<prefix>\w*))?$/;

function isNamespaceKey(key: string): boolean {
  return key.match(namespaceRegex) !== null;
}

export function getNamespaceKeyPrefix(key: string): string {
  const matchArr = key.match(namespaceRegex);
  return matchArr?.groups?.prefix ?? "";
}

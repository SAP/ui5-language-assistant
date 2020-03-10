import { compact, filter, find, includes, last, map, reject } from "lodash";
import {
  UI5Namespace,
  UI5SemanticModel
} from "@vscode-ui5/semantic-model-types";
import { isElementSubClass, ui5NodeToFQN } from "@vscode-ui5/logic-utils";
import { XMLAttribute, XMLElement } from "@xml-tools/ast";
import { isElementApplicableForNamespaceSuggestions } from "./utility";
import { UI5AttributeNameCompletionOptions } from "./index";
import { XMLViewCompletion } from "../../../api";

/**
 * Suggests Namespaces inside Element
 * For example xmlns:m should provide list of namespaces ending with .m.. (like "sap.m", "sap.ui.core.mvc")
 * attribute is namespace attribute if it's equal to "xmlns" or starts with "xmlns:"
 * in first case all possible namespaces of semantic module will be provided excluding pre-existing ones
 */
export function namespaceKeysSuggestions(
  opts: UI5AttributeNameCompletionOptions
): XMLViewCompletion[] {
  const ui5Model = opts.context;

  if (
    !areNamespacesSuggestionsKeysApplicable(opts.prefix, ui5Model, opts.element)
  ) {
    return [];
  }

  const astElement = opts.element;

  const existingNamespacesAttributes: XMLAttribute[] = filter(
    astElement.attributes,
    isExistingNamespaceAttribute
  );

  const existingNamespacesNames: string[] = compact(
    map(existingNamespacesAttributes, _ => _.value)
  );

  const prefix = getNamespaceKeyPrefix(opts.prefix);

  const applicableNamespaces = filter(ui5Model.namespaces, _ =>
    isNamespaceApplicable(_, prefix)
  );

  const suggestedNamespaces = reject(applicableNamespaces, _ =>
    includes(existingNamespacesNames, ui5NodeToFQN(_))
  );

  return map(suggestedNamespaces, _ => ({
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

function areNamespacesSuggestionsKeysApplicable(
  prefix: string | undefined,
  model: UI5SemanticModel,
  element: XMLElement
): prefix is string {
  if (prefix === undefined || !isNamespaceKey(prefix)) {
    return false;
  }
  return isElementApplicableForNamespaceSuggestions(element, model);
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

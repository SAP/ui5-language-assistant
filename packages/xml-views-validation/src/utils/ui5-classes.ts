import { XMLElement } from "@xml-tools/ast";
import {
  resolveXMLNS,
  getUI5ClassByXMLElement,
} from "@ui5-language-assistant/logic-utils";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { SVG_NS, TEMPLATING_NS, XHTML_NS } from "./special-namespaces";

// Heuristic to limit false positives by only checking tags starting with upper
// case names, This would **mostly** limit the checks for things that can actually be
// UI5 Elements / Controls.
export function isPossibleCustomClass(
  xmlElement: XMLElement & { name: string }
): boolean {
  return /^[A-Z]/.test(xmlElement.name) && !isPartOfUI5Namespace(xmlElement);
}

export function isKnownUI5Class(
  xmlElement: XMLElement,
  model: UI5SemanticModel
): boolean {
  const ui5Class = getUI5ClassByXMLElement(xmlElement, model);

  return ui5Class !== undefined;
}

const whiteListedNamespaces: Record<string, boolean> = {
  [SVG_NS]: true,
  [TEMPLATING_NS]: true,
  [XHTML_NS]: true,
};

Object.freeze(whiteListedNamespaces);

function isPartOfUI5Namespace(xmlElement: XMLElement): boolean {
  const parentResolvedNamespace = resolveXMLNS(xmlElement);
  if (parentResolvedNamespace === undefined) {
    return false;
  }

  return whiteListedNamespaces[parentResolvedNamespace];
}

import { XMLElement } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { SVG_NS, TEMPLATING_NS, XHTML_NS, resolveXMLNS } from "../api";
import { getUI5ClassByXMLElement } from "./xml-node-to-ui5-node";

// Heuristic to limit false positives by only checking tags starting with upper
// case names, This would **mostly** limit the checks for things that can actually be
// UI5 Elements / Controls.
export function isPossibleCustomClass(
  xmlElement: XMLElement & { name: string }
): boolean {
  return (
    /^[A-Z]/.test(xmlElement.name) && !isCommonExternalNamespace(xmlElement)
  );
}

export function isKnownUI5Class(
  xmlElement: XMLElement,
  model: UI5SemanticModel
): boolean {
  const ui5Class = getUI5ClassByXMLElement(xmlElement, model);

  return ui5Class !== undefined;
}

const allowedListedNamespaces: Record<string, boolean> = {
  [SVG_NS]: true,
  [TEMPLATING_NS]: true,
  [XHTML_NS]: true,
};

Object.freeze(allowedListedNamespaces);

function isCommonExternalNamespace(xmlElement: XMLElement): boolean {
  const parentResolvedNamespace = resolveXMLNS(xmlElement);
  if (parentResolvedNamespace === undefined) {
    return false;
  }

  return allowedListedNamespaces[parentResolvedNamespace];
}

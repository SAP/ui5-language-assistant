import { SVG_NS, TEMPLATING_NS, XHTML_NS } from "./special-namespaces";
import { XMLElement } from "@xml-tools/ast";
import { resolveXMLNS } from "@ui5-language-assistant/logic-utils";

// Heuristic to limit false positives by only checking tags starting with upper
// case names, This would **mostly** limit the checks for things that can actually be
// UI5 Elements / Controls.
export function isCustomClass(xmlElement: XMLElement): boolean {
  // This will never happen - it was checked before calling this function
  /* istanbul ignore if */
  if (xmlElement.name === null) {
    return false;
  }

  return /^[A-Z]/.test(xmlElement.name) && !isNoneUI5id(xmlElement);
}

// We only care about UI5 elements/controls IDs when check non-unique IDs
// `id` attributes in these: **known** namespaces which are sometimes used
// in UI5 xml-views are definitively not relevant for this validation
const whiteListedNamespaces: Record<string, boolean> = {
  [SVG_NS]: true,
  [TEMPLATING_NS]: true,
  [XHTML_NS]: true,
};

Object.freeze(whiteListedNamespaces);

function isNoneUI5id(xmlElement: XMLElement): boolean {
  const parentResolvedNamespace = resolveXMLNS(xmlElement);
  if (parentResolvedNamespace === undefined) {
    return false;
  }

  return whiteListedNamespaces[parentResolvedNamespace];
}

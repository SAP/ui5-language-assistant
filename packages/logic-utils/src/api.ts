export { xmlToFQN, xmlClosingTagToFQN } from "./utils/xml-to-fqn";
export { ui5NodeToFQN } from "./utils/ui5-node-to-fqn";
export { getSuperClasses } from "./utils/get-super-class";
export { isElementSubClass } from "./utils/is-element-sub-class";
export {
  flattenAggregations,
  flattenEvents,
  flattenProperties,
  flattenAssociations,
} from "./utils/flatten-members";
export {
  findClassesMatchingType,
  classIsOfType,
} from "./utils/find-classes-matching-type";
export { isRootSymbol, getRootSymbolParent } from "./utils/root-symbols";
export { typeToString } from "./utils/type-to-string";
export {
  getUI5ClassByXMLElement,
  getUI5KindByXMLElement,
  getUI5ClassByXMLElementClosingTag,
  getUI5AggregationByXMLElement,
  getUI5PropertyByXMLAttributeKey,
  getUI5AggregationByXMLAttributeKey,
  getUI5NodeByXMLAttribute,
  getUI5NodeFromXMLElementNamespace,
} from "./utils/xml-node-to-ui5-node";
export {
  getDeprecationPlainTextSnippet,
  getDeprecationMessage,
  convertJSDocToMarkdown,
  getLink,
} from "./utils/documentation";
export { splitQNameByNamespace } from "./utils/split-qname";
export {
  resolveXMLNS,
  resolveXMLNSFromPrefix,
  isSameXMLNS,
  isSameXMLNSFromPrefix,
} from "./utils/xml-namespaces";

export { fetch } from "./utils/fetch";
export { tryFetch, getLocalUrl } from "./utils/fetch-helper";
export { isXMLView } from "./utils/document";

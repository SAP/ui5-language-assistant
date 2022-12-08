import { XMLElement, XMLAttribute } from "@xml-tools/ast";
import {
  BaseUI5Node,
  UI5Aggregation,
  UI5Class,
  UI5Event,
  UI5Interface,
  UI5Prop,
  UI5Association,
  UI5SemanticModel,
  UI5Type,
  UI5DeprecatedInfo,
} from "@ui5-language-assistant/semantic-model-types";

export interface OffsetRange {
  start: number;
  end: number;
}

/**
 * Resolves an XML Tag's fully qualified name using available `xmlns`
 * and UI5 semantics.
 */
export function xmlToFQN(astElement: XMLElement): string;

/**
 * Resolve and XML closing tag's fully qualified name using available `xmlns`
 * and UI5 semantics.
 */
export function xmlClosingTagToFQN(astElement: XMLElement): string;

/**
 * Returns the fully qualified name of a UI5 Semantic Model Node.
 */
export function ui5NodeToFQN(ui5Node: BaseUI5Node): string;

/**
 * Returns a list of all "ancestors" classes.
 */
export function getSuperClasses(clazz: UI5Class): UI5Class[];

/**
 * Returns `true` if the provided class extends "sap.ui.core.Element"
 * - The inheritance relation may be transitive.
 * - Note that sap.ui.core.Control extends sap.ui.core.Element directly.
 */
export function isElementSubClass(
  clazz: UI5Class | undefined
): clazz is UI5Class;

/**
 * Returns a list of all direct and borrowed aggregations of a UI5 Class
 */
export function flattenAggregations(ui5Class: UI5Class): UI5Aggregation[];

/**
 * Returns a list of all direct and borrowed properties of a UI5 Class
 */
export function flattenProperties(ui5Class: UI5Class): UI5Prop[];

/**
 * Returns a list of all direct and borrowed events of a UI5 Class
 */
export function flattenEvents(ui5Class: UI5Class): UI5Event[];

/**
 * Returns a list of all direct and borrowed associations of a UI5 Class
 */
export function flattenAssociations(ui5Class: UI5Class): UI5Association[];

/**
 * Returns a list of all UI5Classes in the model which either extend (transitively)
 * or Implement (Directly) the `type`.
 */
export function findClassesMatchingType({
  type,
  model,
}: {
  type: UI5Class | UI5Interface;
  model: UI5SemanticModel;
}): UI5Class[];

/**
 * Check if a UI5 Class is type of the give `type`.
 */
export function classIsOfType(
  clazz: UI5Class,
  type: UI5Class | UI5Interface
): boolean;

/**
 * Check if a UI5 node is a root symbol. A root symbol is a symbol that exists in one of the model symbol maps.
 */
export function isRootSymbol(node: BaseUI5Node): boolean;

/**
 * Get the root symbol parent of a UI5 node (for example, get the class of a property).
 * The same node is returned for root symbols.
 */
export function getRootSymbolParent(node: BaseUI5Node): BaseUI5Node | undefined;

/**
 * Return a human-readable string representation of a UI5 type
 */
export function typeToString(type: UI5Type | undefined): string;

/**
 * Return the UI5 Class for an XML Element
 * @param element
 * @param model
 */
export function getUI5ClassByXMLElement(
  element: XMLElement,
  model: UI5SemanticModel
): UI5Class | undefined;

/**
 * Return the UI5 Class for an XML Element closing tag
 * @param element
 * @param model
 */
export function getUI5ClassByXMLElementClosingTag(
  element: XMLElement,
  model: UI5SemanticModel
): UI5Class | undefined;

/**
 * Return the UI5 Aggregation for an XML Element
 * @param element
 * @param model
 */
export function getUI5AggregationByXMLElement(
  element: XMLElement,
  model: UI5SemanticModel
): UI5Aggregation | undefined;

/**
 * Return the UI5 Property for an XML Attribute
 * @param attribute
 * @param model
 */
export function getUI5PropertyByXMLAttributeKey(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): UI5Prop | undefined;

/**
 * Return the UI5 node for an XML Attribute
 * @param attribute
 * @param model
 */
export function getUI5NodeByXMLAttribute(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): UI5Prop | UI5Event | UI5Association | UI5Aggregation | undefined;

/**
 * Return the UI5 Namespace from the specified or default XML Element namespace
 *
 * @param xmlElement
 * @param model
 */
export function getUI5NodeFromXMLElementNamespace(
  xmlElement: XMLElement,
  model: UI5SemanticModel
): {
  namespace: BaseUI5Node | undefined;
  isDefault: boolean;
  isXmlnsDefined: boolean;
};

/**
 * Get the deprecated message. The returned string contains jsdoc tags.
 *
 * @param opts.title - The opening sentence for the deprecation message. It should not contain a dot. "Deprecated" by default.
 */
export function getDeprecationMessage(opts: {
  title?: string;
  since: string | undefined;
  text: string | undefined;
}): string;

/**
 * Get a snippet (first line) of the deprecated documentation without jsdoc tags.
 *
 * @param opts.title - The opening sentence for the deprecation message. It should not contain a dot. "Deprecated" by default.
 */
export function getDeprecationPlainTextSnippet(opts: {
  title?: string;
  deprecatedInfo: UI5DeprecatedInfo;
  model: UI5SemanticModel;
}): string;

/**
 * Convert jsdoc description to markdown format string
 * @param jsdocDescription
 * @param model
 */
export function convertJSDocToMarkdown(
  jsdocDescription: string,
  model: UI5SemanticModel
): string;

/**
 * Get a link according to the link text.
 * Supported links:
 * - http/https links - returned as-is
 * - Other strings are considered to be UI5 FQNs. A link to the relevant SDK page is returned.
 *
 * @param model
 * @param link
 */
export function getLink(model: UI5SemanticModel, link: string): string;

/**
 * Split possibly qualified XML Tag or XML Attribute name to prefix and local name.
 * If there is no prefix in the qualified name, the returned prefix will be undefined.
 * @param qName
 */
export function splitQNameByNamespace(
  qName: string
): { prefix: string | undefined; localName: string };

/**
 * Return the xml namespace defined for the xml element prefix (ns), or undefined if not found
 * @param xmlElement
 */
export function resolveXMLNS(xmlElement: XMLElement): string | undefined;

/**
 * Return the xml namespace defined for this prefix, or undefined if not found.
 * The defined namespaces are taken from the xml element.
 * @param prefix
 * @param xmlElement
 */
export function resolveXMLNSFromPrefix(
  prefix: string | undefined,
  xmlElement: XMLElement
): string | undefined;

/**
 * Check if the xml element namespace prefixes (ns) reference the same namespace
 * @param xmlElement1
 * @param xmlElement2
 */
export function isSameXMLNS(
  xmlElement1: XMLElement,
  xmlElement2: XMLElement
): boolean;

/**
 * Check if the xml namespace prefixes reference the same namespace.
 * The defined namespaces are taken from the respective xml elements.
 * @param prefix1
 * @param xmlElement1
 * @param prefix2
 * @param xmlElement2
 */
export function isSameXMLNSFromPrefix(
  prefix1: string | undefined,
  xmlElement1: XMLElement,
  prefix2: string | undefined,
  xmlElement2: XMLElement
): boolean;

export {
  ILogger,
  getLogLevel,
  getLogger,
  setLogLevel,
  LogLevel,
} from "./src/api";

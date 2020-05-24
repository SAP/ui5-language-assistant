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

/**
 * Resolves an XML Tag's fully qualified name using available `xmlns`
 * and UI5 semantics.
 */
export function xmlToFQN(astElement: XMLElement): string;

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
 * @param opts.title - The opening sentance for the deprecation message. It should not contain a dot. "Deprecated" by default.
 */
export function getDeprecationMessage(opts: {
  title?: string;
  since: string | undefined;
  text: string | undefined;
}): string;

/**
 * Get a snippet (first line) of the deprecated documentation without jsdoc tags.
 *
 * @param title - The opening sentance for the deprecation message. It should not contain a dot. "Deprecated" by default.
 * @param deprecatedInfo
 * @param model
 */
export function getDeprecationPlainTextSnippet(
  title: string | undefined,
  deprecatedInfo: UI5DeprecatedInfo,
  model: UI5SemanticModel
): string;

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

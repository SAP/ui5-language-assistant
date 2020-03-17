import { XMLElement } from "@xml-tools/ast";
import {
  BaseUI5Node,
  UI5Aggregation,
  UI5Class,
  UI5Event,
  UI5Interface,
  UI5Prop,
  UI5SemanticModel
} from "@ui5-editor-tools/semantic-model-types";

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
 * Returns `true` iff the provided class extends "sap.ui.core.Element"
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
 * Returns a list of all UI5Classes in the model which either extend (transitively)
 * or Implement (Directly) the `type`.
 */
export function findClassesMatchingType({
  type,
  model
}: {
  type: UI5Class | UI5Interface;
  model: UI5SemanticModel;
}): UI5Class[];

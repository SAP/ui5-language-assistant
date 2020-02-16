import { XMLElement } from "@xml-tools/ast";
import {
  BaseUI5Node,
  UI5Aggregation,
  UI5Class
} from "@vscode-ui5/semantic-model";

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
 * TODO: change to isControlOrElement.
 * Returns `true` iff the provided class extends "sap.ui.core.Control"
 * - The inheritance relation may be transitive.
 */
export function isControlSubClass(clazz: UI5Class): boolean;

/**
 * Returns a list of all direct and borrowed aggregations of a UI5 Class
 */
export function flattenAggregations(ui5Class: UI5Class): UI5Aggregation[];

import { PropertyBindingInfoTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
export interface BaseContext {
  element: BindingTypes.StructureElement;
}
/**
 * Initial scenario
 * a. ""
 */
export interface InitialContext {
  type: "initial";
  kind: "expression-binding"; // provides expression binding as code completion item
}
/**
 * Empty scenario
 * a. { }
 */
export interface EmptyContext {
  type: "empty";
  kind: "properties"; // all properties
}
/**
 * Key context scenarios
 *
 * a. `<CURSOR>`keyProperty
 *
 * b. keyProperty`<CURSOR>`
 *
 * c. key`<CURSOR>`Property
 */
export interface KeyContext extends BaseContext {
  type: "key";
  kind: "properties-excluding-duplicate"; // all properties excluding already used properties
}

/**
 * Value context scenarios
 *
 * a. keyProperty: `<CURSOR>`
 *
 * b. keyProperty: `<CURSOR>`'value-for-this-key'
 *
 * c. keyProperty: `<CURSOR>`  'value-for-this-key' [space]
 *
 * d. keyProperty: 'value-for`<CURSOR>`-this-key'
 *
 * e. keyProperty: 'value-for-this-key'`<CURSOR>`
 *
 */
export interface ValueContext extends BaseContext {
  type: "value";
  kind: "value";
}
/**
 * Key value context scenarios
 *
 * a. keyProperty: 'value-for-this-key'  `<CURSOR>` [spaces]
 *
 * b. keyProperty: 'value-for-this-key', `<CURSOR>` [comma]
 *
 * c. `<CURSOR>` keyProperty: 'value-for-this-key'
 *
 * d. keyProperty: 'value-for-this-key',`<CURSOR>`, [between comma]
 */
export interface KeyValueContext extends BaseContext {
  type: "key-value";
  kind: "properties-with-value-excluding-duplicate";
}

/**
 * Colon context scenario
 *
 * a. keyProperty `<CURSOR>` 'value-for-this-key'
 *
 * b. keyProperty `<CURSOR>` [space(s)]
 */
export interface ColonContext extends BaseContext {
  type: "colon";
  kind: "colon";
}
/**
 * Unknown context. Any context except above is unknown and not code completion is provided
 */
export interface UnknownContext {
  type: "unknown";
  kind: "unknown";
}

export type CursorContext =
  | InitialContext
  | EmptyContext
  | KeyContext
  | ValueContext
  | KeyValueContext
  | ColonContext
  | UnknownContext;

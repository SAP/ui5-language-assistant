import { BindingParserTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
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
 * g. keyProperty `<CURSOR>` 'value-for-this-key' [missing colon]
 *
 * h. keyProperty `<CURSOR>` [space(s)] [missing colon]
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
export interface KeyValueContext {
  type: "key-value";
  kind: "properties-with-value-excluding-duplicate";
}
export type CursorContext =
  | InitialContext
  | EmptyContext
  | KeyContext
  | ValueContext
  | KeyValueContext;

export interface SemanticModel {
  classes: Record<string, UI5Class>;
  enums: Record<string, UI5Enum>;
  namespaces: Record<string, UI5Namespace>;
  typedefs: Record<string, UI5Types>;
}

export interface UI5Class {
  // TODO: FQN needed? or is this only on the symbol table
  name: string;
  // TODO: Parent Namespace ref needed?
  extends: UI5Class;
  implements: UI5Interface[];
  constructor: UI5Method;
  properties: UI5Prop[];
  aggregations: UI5Aggregation[];
  associations: UI5Association[];
  events: UI5Event[];
}

export interface UI5Enum {}

export interface UI5Namespace {}

export interface UI5Types {}

export interface UI5Method {}

export interface UI5Prop {}

export interface UI5Aggregation {}

export interface UI5Association {}

export interface UI5Event {}

export interface UI5Interface {}

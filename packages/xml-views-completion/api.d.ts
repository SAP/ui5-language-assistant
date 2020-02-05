export interface UI5SemanticModel {
  version: string;
  classes: Record<string, UI5Class>;
  enums: Record<string, UI5Enum>;
  namespaces: Record<string, UI5Namespace>;
  // - only 10 of these in whole OpenUI (1.60) api.jsons
  // Likely Not Relevant for XML.Views
  typedefs: Record<string, UI5Typedef>;
  // Likely Not Relevant for XML.Views
  functions: Record<string, UI5Function>;

  // TODO: maybe we need a general FQN->Instance dictionary?
  // TODO: do we need interfaces at the top level?
}

export interface UI5Meta {
  library: string;
  description?: string;
  since?: string;
  deprecatedInfo?: UI5DeprecatedInfo;
  visibility: UI5Visibility;
}

export interface UI5Class extends UI5Meta {
  kind: "UI5Class";
  name: string;
  extends?: UI5Class;
  implements: UI5Interface[];
  // TODO: do we need this?
  constructor: UI5Method;
  // Likely Not Relevant for XML.Views
  methods: UI5Method[];
  properties: UI5Prop[];
  aggregations: UI5Aggregation[];
  associations: UI5Association[];
  events: UI5Event[];
}

export interface UI5Enum extends UI5Meta {
  kind: "UI5Enum";
  name: string;
  fields: UI5EnumValue[];
}

export interface UI5EnumValue extends UI5Meta {
  kind: "UI5EnumValue";
  name: string;
}

export interface UI5Namespace extends UI5Meta {
  kind: "UI5Namespace";
  name: string;
  // Likely Not Relevant for XML.Views
  field: UI5Field[];
  // Likely Not Relevant for XML.Views
  methods: UI5Method[];
  namespaces: UI5Namespace[];
  // TODO: maybe we need all children here nested for string literal auto complelte ("a.b.c...")
}

// Likely Not Relevant for XML.Views
export interface UI5Typedef extends UI5Meta {
  kind: "UI5Typedef";
  name: string;
  // TODO: TBD: Ignoring this type's content at this time.
}

// Likely Not Relevant for XML.Views
export interface UI5Method extends UI5Meta {
  kind: "UI5Method";
  name: string;
  // TODO: TBD: Ignoring this type's content at this time.
}

// Likely Not Relevant for XML.Views
export interface UI5Function extends UI5Meta {
  kind: "UI5Function";
  name: string;
  // TODO: TBD: Ignoring this type's content at this time.
}

export interface UI5Prop extends UI5Meta {
  kind: "UI5Prop";
  name: string;
  // TODO: how deeply do we need to analyze types?
  type: string;
  default: string;
}

export interface UI5Field extends UI5Meta {
  kind: "UI5Field";
  name: string;
  type: string;
}

export interface UI5Aggregation extends UI5Meta {
  kind: "UI5Aggregation";
  name: string;
  type: string;
  cardinality: UI5Cardinality;
  altTypes: string[];
}

export interface UI5Association extends UI5Meta {
  kind: "UI5Association";
  name: string;
  type: string;
  cardinality: UI5Cardinality;
}

export interface UI5Event extends UI5Meta {
  kind: "UI5Event";
  name: string;
  // Details on parameter type are Likely Not Relevant for XML.Views
}

export interface UI5Interface extends UI5Meta {
  kind: "UI5Interface";
  // Likely Not Relevant for XML.Views
  methods: UI5Method[];
  events: UI5Event[];
  // I could not locate any UI5 Interfaces with fields/properties...
}

export type UI5Visibility = "restricted" | "protected" | "public" | "private";
export type UI5Cardinality = "0..1" | "0..n";

export interface UI5DeprecatedInfo {
  isDeprecated: boolean;
  since: string;
}

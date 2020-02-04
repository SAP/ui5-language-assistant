export interface UI5SemanticModel {
  version: string;
  classes: Record<string, UI5Class>;
  enums: Record<string, UI5Enum>;
  namespaces: Record<string, UI5Namespace>;
  // - only 10 of these in whole OpenUI (1.60) api.jsons
  // Likely Not Relevant for XML.Views
  typedefs: Record<string, UI5Typedef>;
  functions: Record<string, UI5Function>;
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
}

// Likely Not Relevant for XML.Views
export interface UI5Typedef extends UI5Meta {
  kind: "UI5Typedef";
  // TODO: TBD: Ignoring this type's content at this time.
}

// Likely Not Relevant for XML.Views
export interface UI5Method extends UI5Meta {
  kind: "UI5Method";
  // TODO: TBD: Ignoring this type's content at this time.
}

// Likely Not Relevant for XML.Views
export interface UI5Function extends UI5Meta {
  kind: "UI5Function";
  // TODO: TBD: Ignoring this type's content at this time.
}

export interface UI5Prop extends UI5Meta {
  kind: "UI5Prop";
  name: string;
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
  cardinality: UI5Cardinality;
  altType?: string;
}

export interface UI5Association extends UI5Meta {
  kind: "UI5Association";
  name: string;
  cardinality: UI5Cardinality;
}

export interface UI5Event extends UI5Meta {
  kind: "UI5Event";
  name: string;
  paramType: string;
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

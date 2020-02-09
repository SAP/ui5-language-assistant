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

export interface BaseUI5Node extends UI5Meta {
  name: string;
  parent: BaseUI5Node;
}

export interface UI5Class extends BaseUI5Node {
  kind: "UI5Class";
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

export interface UI5Enum extends BaseUI5Node {
  kind: "UI5Enum";
  fields: UI5EnumValue[];
}

export interface UI5EnumValue extends BaseUI5Node {
  kind: "UI5EnumValue";
}

export interface UI5Namespace extends BaseUI5Node {
  kind: "UI5Namespace";
  // Note: top level Namespaces has an undefined parent
  // This cannot be defined on UI5Namespace because it inherits this property
  // Likely Not Relevant for XML.Views
  field: UI5Field[];
  // Likely Not Relevant for XML.Views
  methods: UI5Method[];
  namespaces: UI5Namespace[];
  // TODO: maybe we need all children here nested for string literal auto complelte ("a.b.c...")
}

// Likely Not Relevant for XML.Views
export interface UI5Typedef extends BaseUI5Node {
  kind: "UI5Typedef";
  // TODO: TBD: Ignoring this type's content at this time.
}

// Likely Not Relevant for XML.Views
export interface UI5Method extends BaseUI5Node {
  kind: "UI5Method";
  // TODO: TBD: Ignoring this type's content at this time.
}

// Likely Not Relevant for XML.Views
export interface UI5Function extends BaseUI5Node {
  kind: "UI5Function";
  // TODO: TBD: Ignoring this type's content at this time.
}

export interface UI5Prop extends BaseUI5Node {
  kind: "UI5Prop";
  // TODO: how deeply do we need to analyze types?
  type: string;
  default: string;
}

export interface UI5Field extends BaseUI5Node {
  kind: "UI5Field";
  type: string;
}

export interface UI5Aggregation extends BaseUI5Node {
  kind: "UI5Aggregation";
  type: string;
  cardinality: UI5Cardinality;
  altTypes: string[];
}

export interface UI5Association extends BaseUI5Node {
  kind: "UI5Association";
  type: string;
  cardinality: UI5Cardinality;
}

export interface UI5Event extends BaseUI5Node {
  kind: "UI5Event";
  // Details on parameter type are Likely Not Relevant for XML.Views
}

export interface UI5Interface extends BaseUI5Node {
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

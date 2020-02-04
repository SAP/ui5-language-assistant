// TODO: do we care about the Modules?
//   - https://openui5.hana.ondemand.com/1.72.6/#/api/sap.m.Button
//   - Module: sap/m/Button

export interface SemanticModel {
  version: string;
  classes: Record<string, UI5Class>;
  enums: Record<string, UI5Enum>;
  namespaces: Record<string, UI5Namespace>;
  // TODO: what is this and why do we care? :)
  // - only 10 of these in whole OpenUI (1.60) api.jsons
  typedefs: Record<string, UI5Types>;
}

export interface UI5Meta {
  // TODO: should this be on UI5Meta or only specific `concrete` types?
  library: string;
  description?: string;
  since?: string;
  deprecatedInfo?: UI5DeprecatedInfo;
  visibility: UI5Visibility;
}

export interface UI5Class extends UI5Meta {
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
  name: string;
  fields: UI5EnumValue[];
}

export interface UI5EnumValue extends UI5Meta {
  name: string;
}

export interface UI5Namespace extends UI5Meta {
  name: string;
  // TODO: Does Field === Property?
  // Likely Not Relevant for XML.Views
  field: UI5Field[];
  methods: UI5Method[];
  namespaces: UI5Namespace[];
}

export interface UI5Types {}

export interface UI5Method {}

export interface UI5Prop {}

export interface UI5Field {}

export interface UI5Aggregation {}

export interface UI5Association {}

export interface UI5Event {}

export interface UI5Interface {}

export type UI5Visibility = "restricted" | "protected" | "public" | "private";

export interface UI5DeprecatedInfo {
  isDeprecated: boolean;
  since: string;
}

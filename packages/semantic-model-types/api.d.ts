export type UI5Framework = "OPENUI5" | "SAPUI5";

export interface UI5SemanticModel {
  version?: string;
  framework?: UI5Framework;
  includedLibraries: string[];
  classes: Record<string, UI5Class>;
  enums: Record<string, UI5Enum>;
  namespaces: Record<string, UI5Namespace>;
  interfaces: Record<string, UI5Interface>;
  // - only 10 of these in whole OpenUI (1.60) api.jsons
  // Likely Not Relevant for XML.Views
  typedefs: Record<string, UI5Typedef>;
  // Likely Not Relevant for XML.Views
  functions: Record<string, UI5Function>;
}

export interface UI5Meta {
  library: string;
  description: string | undefined;
  since: string | undefined;
  deprecatedInfo: UI5DeprecatedInfo | undefined;
  experimentalInfo: UI5ExperimentalInfo | undefined;
  visibility: UI5Visibility;
}

export interface BaseUI5Node extends UI5Meta {
  name: string;
  kind: string;
  // Note: top level Namespaces has an undefined parent
  // This cannot be defined on UI5Namespace because it inherits this property
  parent: BaseUI5Node | undefined;
}

export interface UI5Class extends BaseUI5Node {
  kind: "UI5Class";
  abstract: boolean;
  extends: UI5Class | undefined;
  implements: UI5Interface[];
  ctor: UI5Constructor | undefined;
  // Likely Not Relevant for XML.Views
  methods: UI5Method[];
  properties: UI5Prop[];
  // Likely Not Relevant for XML.Views
  fields: UI5Prop[];
  aggregations: UI5Aggregation[];
  associations: UI5Association[];
  events: UI5Event[];
  defaultAggregation: UI5Aggregation | undefined;
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
  // Likely Not Relevant for XML.Views
  fields: UI5Field[];
  // Likely Not Relevant for XML.Views
  methods: UI5Method[];
  events: UI5Event[];
  namespaces: Record<string, UI5Namespace>;
  classes: Record<string, UI5Class>;
  // TODO: maybe we need all children here nested for string literal auto complete ("a.b.c...")
}

// Likely Not Relevant for XML.Views
export interface UI5Typedef extends BaseUI5Node {
  kind: "UI5Typedef";
  // TODO: TBD: Ignoring this type's content at this time.
}

// Likely Not Relevant for XML.Views
export interface UI5Constructor extends BaseUI5Node {
  kind: "UI5Constructor";
  name: "";
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
  type: UI5Type | undefined;
  default: unknown; // This should be of the property's type
}

export interface UI5Field extends BaseUI5Node {
  kind: "UI5Field";
  type: UI5Type | undefined;
}

export interface UI5Aggregation extends BaseUI5Node {
  kind: "UI5Aggregation";
  type: UI5Type | undefined;
  cardinality: UI5Cardinality;
  altTypes: UI5Type[];
}

export interface UI5Association extends BaseUI5Node {
  kind: "UI5Association";
  type: UI5Type | undefined;
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

export type UI5Visibility =
  | "restricted"
  | "protected"
  | "public"
  | "private"
  | "hidden";
export type UI5Cardinality = "0..1" | "0..n";

export interface UI5DeprecatedInfo {
  isDeprecated: boolean;
  since: string | undefined;
  text: string | undefined;
}

export interface UI5ExperimentalInfo {
  isExperimental: boolean;
  since: string | undefined;
  text: string | undefined;
}

export interface ArrayType {
  kind: "ArrayType";
  type: UI5Type | undefined;
}

export interface PrimitiveType {
  kind: "PrimitiveType";
  name: PrimitiveTypeName;
}

export interface UnresolvedType {
  kind: "UnresolvedType";
  name: string;
}

export type UI5Type =
  | UI5Class
  | UI5Interface
  | UI5Enum
  | UI5Namespace
  | UI5Typedef
  | ArrayType
  | PrimitiveType
  | UnresolvedType;

// TODO Should we keep int and float in addition to number? Should we keep both object and map?
export type PrimitiveTypeName =
  | "String"
  | "Boolean"
  | "Number"
  | "Integer"
  | "Float"
  | "Object"
  | "Map"
  | "Function";

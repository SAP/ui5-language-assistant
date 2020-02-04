export interface SemanticModel {
  classes: Record<string, UI5Class>;
  enums: Record<string, UI5Enum>;
  namespaces: Record<string, UI5Namespace>;
  typedefs: Record<string, UI5Types>;
}

export interface UI5Class {}

export interface UI5Enum {}

export interface UI5Namespace {}

export interface UI5Types {}

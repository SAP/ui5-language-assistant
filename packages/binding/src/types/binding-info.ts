import { Context } from "@ui5-language-assistant/context";
import { TextDocumentPositionParams } from "vscode-languageserver-protocol";

export enum TypeKind {
  "string" = "string",
  "boolean" = "boolean",
  "object" = "object",
}
export enum BindingInfoName {
  "path" = "path",
  "value" = "value",
  "model" = "model",
  "suspended" = "suspended",
  "formatter" = "formatter",
  "useRawValues" = "useRawValues",
  "useInternalValues" = "useInternalValues",
  "type" = "type",
  "targetType" = "targetType",
  "constraints" = "constraints",
  "mode" = "mode",
  "parameters" = "parameters",
  "events" = "events",
  "parts" = "parts",
  "formatOptions" = "formatOptions",
}
export interface Dependents {
  name: BindingInfoName;
  type: PropertyType[];
}
export interface PropertyType {
  kind: string;
  // kind: TypeKind;
  default?: {
    values: (string | boolean)[];
    fixed: boolean;
  };
  dependents: Dependents[];
  notAllowedElements: BindingInfoName[];
  collection?: boolean;
}
export interface PropertyBindingInfoElement {
  name: BindingInfoName;
  type: PropertyType[];
  documentation: {
    type: string;
    optional?: boolean;
    visibility: string;
    description: string;
  };
}

export interface BindContext extends Context {
  textDocumentPosition?: TextDocumentPositionParams;
  doubleQuotes?: boolean;
}

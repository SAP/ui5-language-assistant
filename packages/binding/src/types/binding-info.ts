import { Context } from "@ui5-language-assistant/context";
import {
  MarkupKind,
  TextDocumentPositionParams,
} from "vscode-languageserver-protocol";

export enum TypeKind {
  "string" = "string",
  "String" = "string",
  "function" = "string",
  "Function" = "string",
  "boolean" = "boolean",
  "Boolean" = "boolean",
  "object" = "object",
  "Object" = "object",
  "PropertyBindingInfo" = "object",
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
  kind: TypeKind;
  possibleValue?: {
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
    kind: MarkupKind;
    value: string;
  };
}

export interface BindContext extends Context {
  textDocumentPosition?: TextDocumentPositionParams;
  doubleQuotes?: boolean;
}

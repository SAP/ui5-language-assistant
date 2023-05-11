import { Context } from "@ui5-language-assistant/context";
import { TextDocumentPositionParams } from "vscode-languageserver-protocol";

export type TypeKind = "string" | "boolean" | "object";
export type BindingInfoName =
  | "path"
  | "value"
  | "model"
  | "suspended"
  | "formatter"
  | "useRawValues"
  | "useInternalValues"
  | "type"
  | "targetType"
  | "constraints"
  | "mode"
  | "parameters"
  | "events"
  | "parts"
  | "formatOptions";
export interface Dependents {
  name: BindingInfoName;
  type: PropertyType[];
}
export interface PropertyType {
  kind: TypeKind;
  dependents: Dependents[];
  notAllowedElements: BindingInfoName[];
  collection?: boolean;
}
export interface PropertyBindingInfoElement {
  name: BindingInfoName;
  type: PropertyType[];
  description: {
    text: string;
    visibility: "Public";
  };
}

export interface BindContext extends Context {
  textDocumentPosition?: TextDocumentPositionParams;
  doubleQuotes?: boolean;
}

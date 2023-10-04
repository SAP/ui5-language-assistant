import { Context } from "@ui5-language-assistant/context";
import {
  MarkupKind,
  TextDocumentPositionParams,
} from "vscode-languageserver-protocol";

export enum TypeKind {
  "integer" = "integer",
  "Integer" = "integer",
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
  // common between PropertyBindingInfo and AggregationBindingInfo
  events = "events",
  model = "model",
  path = "path",
  parameters = "parameters",
  suspended = "suspended",
  // PropertyBindingInfo only
  constraints = "constraints",
  formatter = "formatter",
  formatOptions = "formatOptions",
  mode = "mode",
  parts = "parts",
  type = "type",
  targetType = "targetType",
  useRawValues = "useRawValues",
  useInternalValues = "useInternalValues",
  value = "value",
  // AggregationBindingInfo only
  factory = "factory",
  filters = "filters",
  groupHeaderFactory = "groupHeaderFactory",
  key = "key",
  length = "length",
  sorter = "sorter",
  startIndex = "startIndex",
  template = "template",
  templateShareable = "templateShareable",
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
export interface BindingInfoElement {
  name: string;
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

export enum ClassName {
  "Sorter" = "Sorter",
  "Filter" = "Filter",
}

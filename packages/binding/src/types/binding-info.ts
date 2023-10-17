import { Context } from "@ui5-language-assistant/context";
import {
  MarkupKind,
  TextDocumentPositionParams,
} from "vscode-languageserver-protocol";

export enum TypeKind {
  integer = "integer",
  Integer = "integer",
  string = "string",
  String = "string",
  function = "string",
  Function = "string",
  boolean = "boolean",
  Boolean = "boolean",
  object = "object",
  Object = "object",
  PropertyBindingInfo = "object",
  any = "any",
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
  name: string;
  type: PropertyType[];
}
/**
 * Represents the type of a property.
 */
export interface PropertyType {
  /**
   * The kind of the property type.
   */
  kind: TypeKind;

  /**
   * Specifies the possible values for the property.
   */
  possibleValue?: {
    /**
     * An array of possible values for the property.
     */
    values: (string | boolean)[];

    /**
     * Indicates whether the possible values are fixed or not.
     */
    fixed: boolean;
  };

  /**
   * An array of dependent properties.
   */
  dependents: Dependents[];

  /**
   * An array of names of elements that are not allowed for this property.
   */
  notAllowedElements: string[];

  /**
   * Specifies the possible elements for this property.
   */
  possibleElements?: BindingInfoElement[];

  /**
   * Indicates whether the property is a collection or not.
   */
  collection?: boolean;
  /**
   * Indicates reference to other element
   */
  reference?: string;
}

export interface BindingInfoElement {
  name: string;
  type: PropertyType[];
  required?: boolean;
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
  Sorter = "Sorter",
  Filter = "Filter",
}

export enum Operator {
  All = "All",
  Any = "Any",
  BT = "BT",
  Contains = "Contains",
  EndsWith = "EndsWith",
  EQ = "EQ",
  GE = "GE",
  GT = "GT",
  LE = "LE",
  LT = "LT",
  NB = "NB",
  NE = "NE",
  NotContains = "NotContains",
  NotEndsWith = "NotEndsWith",
  NotStartsWith = "NotStartsWith",
  StartsWith = "StartsWith",
}

export enum BindingMode {
  "sap.ui.model.BindingMode.Default" = "sap.ui.model.BindingMode.Default",
  "sap.ui.model.BindingMode.OneTime" = "sap.ui.model.BindingMode.OneTime",
  "sap.ui.model.BindingMode.OneWay" = "sap.ui.model.BindingMode.OneWay",
  "sap.ui.model.BindingMode.TwoWay" = "sap.ui.model.BindingMode.TwoWay",
}

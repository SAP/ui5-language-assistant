import { XMLViewIssueSeverity } from "@ui5-language-assistant/xml-views-validation";
import { Range } from "vscode-languageserver-types";
import { BINDING_ISSUE_TYPE } from "../constant";

export type BindingIssue =
  | MissingKey
  | MissingColon
  | TooManyColons
  | MissingValue
  | MissingComma
  | TooManyCommas
  | Syntax
  | TrailingComma
  | UnknownChar
  | UnknownPropertyBindingInfo
  | MissMatchValue
  | NotAllowedProperty
  | DuplicateProperty
  | RequiredDependency
  | RecursiveProperty
  | Unnecessary
  | MissingBracket;

interface BaseUI5XMLViewBindingIssue {
  issueType: typeof BINDING_ISSUE_TYPE;
  range: Range;
  kind: string;
  message: string;
  severity: XMLViewIssueSeverity;
}

export interface MissingKey extends BaseUI5XMLViewBindingIssue {
  kind: "MissingKey";
}
export interface MissingColon extends BaseUI5XMLViewBindingIssue {
  kind: "MissingColon";
}
export interface TooManyColons extends BaseUI5XMLViewBindingIssue {
  kind: "TooManyColons";
}
export interface MissingValue extends BaseUI5XMLViewBindingIssue {
  kind: "MissingValue";
}
export interface MissingComma extends BaseUI5XMLViewBindingIssue {
  kind: "MissingComma";
}
export interface TooManyCommas extends BaseUI5XMLViewBindingIssue {
  kind: "TooManyCommas";
}
export interface TrailingComma extends BaseUI5XMLViewBindingIssue {
  kind: "TrailingComma";
}
export interface MissingBracket extends BaseUI5XMLViewBindingIssue {
  kind: "MissingBracket";
}
/**
 * All parser error
 */
export interface Syntax extends BaseUI5XMLViewBindingIssue {
  kind: "Syntax";
}
/**
 * All unknown character
 */
export interface UnknownChar extends BaseUI5XMLViewBindingIssue {
  kind: "UnknownChar";
}

export interface UnknownPropertyBindingInfo extends BaseUI5XMLViewBindingIssue {
  kind: "UnknownPropertyBindingInfo";
}
export interface MissMatchValue extends BaseUI5XMLViewBindingIssue {
  kind: "MissMatchValue";
}
export interface NotAllowedProperty extends BaseUI5XMLViewBindingIssue {
  kind: "NotAllowedProperty";
}
export interface DuplicateProperty extends BaseUI5XMLViewBindingIssue {
  kind: "DuplicateProperty";
}
export interface RequiredDependency extends BaseUI5XMLViewBindingIssue {
  kind: "RequiredDependency";
}
export interface Unnecessary extends BaseUI5XMLViewBindingIssue {
  kind: "Unnecessary";
}
export interface RecursiveProperty extends BaseUI5XMLViewBindingIssue {
  kind: "RecursiveProperty";
}

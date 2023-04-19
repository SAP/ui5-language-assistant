import { BaseUI5XMLViewIssue } from "@ui5-language-assistant/xml-views-validation";
import { DiagnosticTag } from "vscode-languageserver-types";

export type AnnotationIssue =
  | UnknownEnumValueIssue
  | UnknownAnnotationPathIssue
  | AnnotationTargetRequiredIssue
  | AnnotationPathRequiredIssue
  | PathDoesNotExistIssue
  | InvalidAnnotationTargetIssue
  | InvalidAnnotationTermIssue
  | PropertyPathNotAllowedIssue
  | PropertyPathRequiredIssue
  | UnknownPropertyPathIssue
  | IncompletePathIssue
  | MissingEntitySetIssue
  | ContextPathBindingIssue;

export const ANNOTATION_ISSUE_TYPE = "annotation-issue";
interface BaseUI5XMLViewAnnotationIssue extends BaseUI5XMLViewIssue {
  issueType: typeof ANNOTATION_ISSUE_TYPE;
  code?: string | number;
  tags?: DiagnosticTag[];
}

export interface UnknownEnumValueIssue extends BaseUI5XMLViewAnnotationIssue {
  kind: "UnknownEnumValue";
}

export interface UnknownAnnotationPathIssue
  extends BaseUI5XMLViewAnnotationIssue {
  kind: "UnknownAnnotationPath";
}

export interface AnnotationTargetRequiredIssue
  extends BaseUI5XMLViewAnnotationIssue {
  kind: "AnnotationTargetRequired";
}

export interface AnnotationPathRequiredIssue
  extends BaseUI5XMLViewAnnotationIssue {
  kind: "AnnotationPathRequired";
}

export interface PropertyPathRequiredIssue
  extends BaseUI5XMLViewAnnotationIssue {
  kind: "PropertyPathRequired";
}

export interface PathDoesNotExistIssue extends BaseUI5XMLViewAnnotationIssue {
  kind: "PathDoesNotExist";
}

export interface InvalidAnnotationTargetIssue
  extends BaseUI5XMLViewAnnotationIssue {
  kind: "InvalidAnnotationTarget";
}

export interface InvalidAnnotationTermIssue
  extends BaseUI5XMLViewAnnotationIssue {
  kind: "InvalidAnnotationTerm";
}

export interface UnknownPropertyPathIssue
  extends BaseUI5XMLViewAnnotationIssue {
  kind: "UnknownPropertyPath";
}

export interface PropertyPathNotAllowedIssue
  extends BaseUI5XMLViewAnnotationIssue {
  kind: "PropertyPathNotAllowed";
}

export interface IncompletePathIssue extends BaseUI5XMLViewAnnotationIssue {
  kind: "IncompletePath";
}

export interface MissingEntitySetIssue extends BaseUI5XMLViewAnnotationIssue {
  kind: "MissingEntitySet";
}

export interface ContextPathBindingIssue extends BaseUI5XMLViewAnnotationIssue {
  kind: "ContextPathBindingNotRecommended";
}

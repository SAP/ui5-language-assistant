import { BaseUI5XMLViewIssue } from "@ui5-language-assistant/xml-views-validation";
import { DiagnosticTag, Range } from "vscode-languageserver-types";
import type { AnnotationIssue } from "@ui5-language-assistant/fe";
import type { BindingIssue } from "@ui5-language-assistant/binding";

export type IssueType = BaseUI5XMLViewIssue | AnnotationIssue | BindingIssue;

interface BaseExternalIssue {
  code?: string | number;
  tags?: DiagnosticTag[];
  range?: Range;
}
export type ExternalIssueType = IssueType & BaseExternalIssue;

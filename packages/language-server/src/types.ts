import { UI5XMLViewIssue } from "@ui5-language-assistant/xml-views-validation";
import type { AnnotationIssue } from "@ui5-language-assistant/fe";
import type { BindingIssue } from "@ui5-language-assistant/binding";

export type IssueType = UI5XMLViewIssue | AnnotationIssue | BindingIssue;

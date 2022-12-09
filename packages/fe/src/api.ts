import type { UI5XMLViewIssue } from "@ui5-language-assistant/xml-views-validation";
import type { AnnotationIssue } from "./types";
import { ANNOTATION_ISSUE_TYPE } from "./types";

export { defaultValidators } from "./services/diagnostics/validators";
export type { AnnotationIssue } from "./types";

export function isAnnotationIssue(
  issue: AnnotationIssue | UI5XMLViewIssue
): issue is AnnotationIssue {
  return (issue as AnnotationIssue).issueType === ANNOTATION_ISSUE_TYPE;
}

export { getCompletionItems } from "./services/completion";

import type { BaseUI5XMLViewIssue } from "@ui5-language-assistant/xml-views-validation";
import type { AnnotationIssue } from "./types";
import { ANNOTATION_ISSUE_TYPE } from "./types";

export { defaultValidators } from "./services/diagnostics/validators";
export type { AnnotationIssue } from "./types";

export function isAnnotationIssue<T extends BaseUI5XMLViewIssue>(
  issue: AnnotationIssue | T
): issue is AnnotationIssue {
  return (issue as AnnotationIssue).issueType === ANNOTATION_ISSUE_TYPE;
}

export { getCompletionItems } from "./services/completion";
export { initI18n } from "./i18n";

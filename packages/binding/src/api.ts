import type { BaseUI5XMLViewIssue } from "@ui5-language-assistant/xml-views-validation";
import type { BindingIssue } from "./types";
import { BINDING_ISSUE_TYPE } from "./types";

// export { getCompletionItems } from "./services/completion";
export { bindingValidators } from "./services/diagnostics/validators";
export type { BindingIssue } from "./types";

export function isBindingIssue<T extends BaseUI5XMLViewIssue>(
  issue: BindingIssue | T
): issue is BindingIssue {
  return (issue as BindingIssue).issueType === BINDING_ISSUE_TYPE;
}

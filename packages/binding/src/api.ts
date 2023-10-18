import type { BindingIssue } from "./types";
import { BINDING_ISSUE_TYPE } from "./types";

export { getCompletionItems } from "./services/completion";
export { bindingValidators } from "./services/diagnostics";
export { getHover } from "./services/hover";
export type { BindingIssue } from "./types";

export function isBindingIssue<T extends { issueType: string }>(
  issue: BindingIssue | T
): issue is BindingIssue {
  return issue.issueType === BINDING_ISSUE_TYPE;
}

export {
  AGGREGATION_BINDING_INFO,
  PROPERTY_BINDING_INFO,
  FILTER_OPERATOR,
} from "./constant";

export { getBindingElements } from "./definition/definition";

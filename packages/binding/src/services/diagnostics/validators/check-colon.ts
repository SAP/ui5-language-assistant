import { BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";
import { PropertyBindingInfoTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
import { rangeToOffsetRange } from "../../../utils/document";
/**
 * Check if colon is missing
 */
export const checkColon = (
  element: BindingTypes.AstElement
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  if (!element.key) {
    return issues;
  }
  if (!element.colon || element.colon?.text === "") {
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "MissingColon",
      message: "Expect colon",
      offsetRange: rangeToOffsetRange(element.key.range),
      range: element.key.range,
      severity: "info",
    });
  }
  return issues;
};

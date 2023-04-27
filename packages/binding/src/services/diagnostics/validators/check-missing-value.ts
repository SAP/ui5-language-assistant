import { BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";
import { PropertyBindingInfoTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
import { rangeToOffsetRange } from "../../../utils";

/**
 * Check missing value
 */
export const checkMissingValue = (
  element: BindingTypes.AstElement,
  parseErrors: BindingTypes.ParseError[]
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  if (!element.key) {
    return issues;
  }
  if (!element.colon) {
    return issues;
  }
  const extraColonIssue = parseErrors.find(
    (item) => item.merged[0]?.tokenTypeName === BindingTypes.COLON
  );
  if (extraColonIssue) {
    return issues;
  }
  if (!element.value) {
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "MissingValue",
      message: "Expect value",
      offsetRange: rangeToOffsetRange(element.colon.range),
      range: {
        start: element.key.range.start,
        end: element.colon.range.end,
      },
      severity: "info",
    });
  }
  return issues;
};

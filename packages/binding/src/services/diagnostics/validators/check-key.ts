import { propertyBindingInfoElements } from "../../../definition/definition";
import { BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";
import { PropertyBindingInfoTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
import { rangeToOffsetRange } from "../../../utils";
/**
 * Check if key is a one of suppored property binding info
 */
export const checkKey = (element: BindingTypes.AstElement): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  if (!element.key) {
    return issues;
  }
  const bindingElement = propertyBindingInfoElements.find(
    (el) => el.name === element.key?.text
  );
  if (!bindingElement) {
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "UnknownPropertyBindingInfo",
      message: "Unknown property binding info",
      offsetRange: rangeToOffsetRange(element.key.range),
      range: element.key.range,
      severity: "info",
    });
    return issues;
  }
  return issues;
};

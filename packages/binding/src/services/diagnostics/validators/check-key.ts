import { propertyBindingInfoElements } from "../../../definition/definition";
import { BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";
import { BindingParserTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
import { clearKey } from "../../..//utils";
/**
 * Check if key is a one of supported property binding info
 */
export const checkKey = (
  element: BindingTypes.StructureElement
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  if (!element.key) {
    return issues;
  }
  const text = clearKey(element.key && element.key.text);
  const bindingElement = propertyBindingInfoElements.find(
    (el) => el.name === text
  );
  if (!bindingElement) {
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "UnknownPropertyBindingInfo",
      message: "Unknown property binding info",
      range: element.key.range,
      severity: "error",
    });
    return issues;
  }
  return issues;
};

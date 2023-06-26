import { propertyBindingInfoElements } from "../../../definition/definition";
import { BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";
import { BindingParserTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
import { findRange } from "../../../utils";
/**
 * Check if key is a one of supported property binding info
 */
export const checkKey = (
  element: BindingTypes.StructureElement
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  if (!element.key) {
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "MissingKey",
      message: "Expect key",
      range: findRange([element.colon?.range, element.value?.range]),
      severity: "error",
    });
    return issues;
  }
  const text = element.key && element.key.text;
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

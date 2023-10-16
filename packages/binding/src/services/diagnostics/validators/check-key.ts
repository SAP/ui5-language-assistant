import {
  BindingIssue,
  BINDING_ISSUE_TYPE,
  BindingInfoElement,
} from "../../../types";
import { BindingParserTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
import { findRange } from "../../../utils";
/**
 * Check if key is a one of supported property binding info
 */
export const checkKey = (
  element: BindingTypes.StructureElement,
  bindingElements: BindingInfoElement[],
  /* istanbul ignore next */
  aggregation = false
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
  const bindingElement = bindingElements.find((el) => el.name === text);
  if (text === "ui5object") {
    return issues;
  }
  if (!bindingElement) {
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "UnknownPropertyBindingInfo",
      message: `Unknown ${
        aggregation ? "aggregation binding" : "property binding info"
      }`,
      range: element.key.range,
      severity: "error",
    });
    return issues;
  }
  return issues;
};

import { BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";
import {
  isCollectionValue,
  isStructureValue,
  PropertyBindingInfoTypes as BindingTypes,
} from "@ui5-language-assistant/binding-parser";
import { rangeToOffsetRange } from "../../../utils";

/**
 * Check parts element MUST not contain another parts element
 */
const getParts = (element: BindingTypes.AstElement) => {
  const issues: BindingIssue[] = [];
  if (isCollectionValue(element.value)) {
    for (const item of element.value.elements) {
      if (isStructureValue(item)) {
        for (const el of item.elements) {
          if (el.key?.text === "parts") {
            issues.push({
              issueType: BINDING_ISSUE_TYPE,
              kind: "RecursiveProperty",
              message: `Recursive composite bindings is not allowed`,
              offsetRange: rangeToOffsetRange(el.range),
              range: el.key?.range ?? el.range,
              severity: "info",
            });
          } else {
            issues.push(...getParts(el));
          }
        }
      }
    }
  }
  return issues;
};
export const checkNestedParts = (
  binding: BindingTypes.Binding
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  // check "parts" element is used
  const parts = binding.elements.find((i) => i.key?.text === "parts");
  if (parts) {
    issues.push(...getParts(parts));
  }

  return issues;
};

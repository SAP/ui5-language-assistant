import { BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";
import {
  isCollectionValue,
  isStructureValue,
  BindingParserTypes as BindingTypes,
} from "@ui5-language-assistant/binding-parser";
import { findRange, isParts } from "../../../utils";
import { t } from "../../../i18n";

/**
 * Check parts element MUST not contain another parts element
 */
const getParts = (element: BindingTypes.StructureElement) => {
  const issues: BindingIssue[] = [];
  if (isCollectionValue(element.value)) {
    for (const item of element.value.elements) {
      if (isStructureValue(item)) {
        for (const el of item.elements) {
          if (isParts(el)) {
            issues.push({
              issueType: BINDING_ISSUE_TYPE,
              kind: "RecursiveProperty",
              message: t("RECURSIVE_COMPOSITE_BINDING"),
              range: findRange([
                /* istanbul ignore next */
                el.key?.range,
                el.range,
              ]),
              severity: "error",
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
  binding: BindingTypes.StructureValue
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  // check "parts" element is used
  const parts = binding.elements.find((i) => isParts(i));
  if (parts) {
    issues.push(...getParts(parts));
  }

  return issues;
};

import {
  BindingIssue,
  BINDING_ISSUE_TYPE,
  BindingInfoElement,
} from "../../../types";
import { BindingParserTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
import { findRange } from "../../../utils";
import { t } from "../../../i18n";
import type { UI5Aggregation } from "@ui5-language-assistant/semantic-model-types";

/**
 * Check if key is a one of supported property binding info
 */
export const checkKey = (
  element: BindingTypes.StructureElement,
  bindingElements: BindingInfoElement[],
  aggregation?: UI5Aggregation
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  if (!element.key) {
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "MissingKey",
      message: t("EXPECT_KEY"),
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
      message: aggregation
        ? t("UNKNOWN_AGGREGATION_BINDING")
        : t("UNKNOWN_PROPERTY_BINDING"),
      range: element.key.range,
      severity: "error",
    });
    return issues;
  }
  return issues;
};

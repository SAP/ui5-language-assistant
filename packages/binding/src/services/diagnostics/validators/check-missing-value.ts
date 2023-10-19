import {
  BindContext,
  BindingIssue,
  BINDING_ISSUE_TYPE,
  BindingInfoElement,
} from "../../../types";
import { BindingParserTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
import { typesToValue } from "../../../utils";
import { t } from "../../../i18n";

/**
 * Check missing value
 */
export const checkMissingValue = (
  context: BindContext,
  element: BindingTypes.StructureElement,
  bindingElements: BindingInfoElement[]
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  if (!element.key) {
    return issues;
  }
  if (!element.colon) {
    return issues;
  }
  if (!element.value) {
    const text = element.key && element.key.text;
    const bindingElement = bindingElements.find((el) => el.name === text);
    let message = t("EXPECT_A_VALUE");
    if (bindingElement) {
      const data = typesToValue({
        types: bindingElement.type,
        context,
        forDiagnostic: true,
      });
      message = t("EXPECT_DATA_AS_A_VALUE", { data: data.join(t("OR")) });
    }
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "MissingValue",
      message,
      range: {
        start: element.key.range.start,
        end: element.colon.range.end,
      },
      severity: "error",
    });
  }
  return issues;
};

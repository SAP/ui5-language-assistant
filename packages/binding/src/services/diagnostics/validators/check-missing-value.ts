import { BindContext, BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";
import { BindingParserTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
import { typesToValue } from "../../../utils";
import { propertyBindingInfoElements } from "../../../definition/definition";

/**
 * Check missing value
 */
export const checkMissingValue = (
  context: BindContext,
  element: BindingTypes.StructureElement
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  if (!element.key) {
    return issues;
  }
  if (!element.colon) {
    return issues;
  }
  if (!element.value) {
    const bindingElement = propertyBindingInfoElements.find(
      (el) => el.name === (element.key && element.key.text)
    );
    let message = "Expect a value";
    if (bindingElement) {
      const data = typesToValue(bindingElement.type, context);
      message = `Expect ${data.join(" or ")} as a value`;
    }
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "MissingValue",
      message,
      range: {
        start: element.key.range.start,
        end: element.colon.range.end,
      },
      severity: "info",
    });
  }
  return issues;
};

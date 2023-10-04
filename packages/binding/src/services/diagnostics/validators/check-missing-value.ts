import { BindContext, BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";
import { BindingParserTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
import { typesToValue } from "../../../utils";
import { getBindingElements } from "../../../definition/definition";

/**
 * Check missing value
 */
export const checkMissingValue = (
  context: BindContext,
  element: BindingTypes.StructureElement,
  aggregation = false
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
    const bindingElement = getBindingElements(context, aggregation).find(
      (el) => el.name === text
    );
    let message = "Expect a value";
    if (bindingElement) {
      const data = typesToValue({
        types: bindingElement.type,
        context,
        forDiagnostic: true,
      });
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
      severity: "error",
    });
  }
  return issues;
};

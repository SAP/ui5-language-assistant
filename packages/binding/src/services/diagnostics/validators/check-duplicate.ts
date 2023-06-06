import { BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";
import { PropertyBindingInfoTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
import { rangeToOffsetRange } from "../../../utils";

const getDuplicate = (ast: BindingTypes.Binding): BindingTypes.AstElement[] => {
  const visited = {};
  const duplicate: BindingTypes.AstElement[] = [];
  for (const element of ast.elements) {
    const key = element.key?.text;
    if (!key) {
      continue;
    }
    if (visited[key]) {
      duplicate.push(element);
    } else {
      visited[key] = true;
    }
  }
  return duplicate;
};
export const checkDuplicate = (
  binding: BindingTypes.Binding
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  const duplicate = getDuplicate(binding);
  duplicate.forEach((item) =>
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "DuplicateProperty",
      message: "Duplicate property",
      offsetRange: rangeToOffsetRange(item.range),
      range: item.key?.range ?? item.range,
      severity: "info",
    })
  );
  return issues;
};

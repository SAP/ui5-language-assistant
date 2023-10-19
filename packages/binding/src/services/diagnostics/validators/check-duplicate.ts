import { BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";
import { BindingParserTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
import { findRange } from "../../../utils";
import { t } from "../../../i18n";

const getDuplicate = (
  ast: BindingTypes.StructureValue
): BindingTypes.StructureElement[] => {
  const visited = {};
  const duplicate: BindingTypes.StructureElement[] = [];
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
  binding: BindingTypes.StructureValue
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  const duplicate = getDuplicate(binding);
  duplicate.forEach((item) =>
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "DuplicateProperty",
      message: t("DUPLICATE_PROPERTY"),
      range: findRange([item.key?.range, item.range]),
      severity: "error",
    })
  );
  return issues;
};

import { BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";
import {
  isStructureValue,
  BindingParserTypes as BindingTypes,
} from "@ui5-language-assistant/binding-parser";
import { findRange } from "../../../utils";
export const checkBrackets = (
  binding: BindingTypes.StructureValue | BindingTypes.CollectionValue
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  if (isStructureValue(binding)) {
    if (!binding.rightCurly || binding.rightCurly.text === "") {
      issues.push({
        issueType: BINDING_ISSUE_TYPE,
        kind: "MissingBracket",
        message: "Expect closing brace",
        range: findRange([binding.range]),
        severity: "error",
      });
    }
    return issues;
  }
  if (!binding.rightSquare || binding.rightSquare.text === "") {
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "MissingBracket",
      message: "Expect closing bracket",
      range: findRange([binding.range]),
      severity: "error",
    });
  }

  return issues;
};

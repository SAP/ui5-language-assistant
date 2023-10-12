import { BindingParserTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
import { findRange } from "../../../utils";
import {
  BindingIssue,
  BINDING_ISSUE_TYPE,
  BindingInfoElement,
} from "../../../types";

export const checkDependents = (
  bindingElements: BindingInfoElement[],
  binding: BindingTypes.StructureValue
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  // collect all definition which has dependencies
  const dependentElements = bindingElements.filter((item) =>
    item.type.find((i) => i.dependents.length > 0)
  );
  for (const dep of dependentElements) {
    // check if an element which has dependency is used
    const dependentElementApplied = binding.elements.find(
      (item) => (item.key && item.key.text) === dep.name
    );
    if (!dependentElementApplied) {
      return issues;
    }
    // check if its dependency is applied too
    for (const types of dep.type) {
      for (const requiredDep of types.dependents) {
        const requiredDepApplied = binding.elements.find(
          (item) => (item.key && item.key.text) === requiredDep.name
        );
        if (!requiredDepApplied) {
          issues.push({
            issueType: BINDING_ISSUE_TYPE,
            kind: "RequiredDependency",
            message: `Required dependency "${requiredDep.name}" should be defined`,
            range: findRange([
              /* istanbul ignore next */
              dependentElementApplied.key?.range,
              dependentElementApplied.range,
            ]),
            severity: "info",
          });
        }
      }
    }
  }
  return issues;
};

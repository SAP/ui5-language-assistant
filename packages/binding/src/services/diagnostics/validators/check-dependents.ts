import {
  isPrimitiveValue,
  PropertyBindingInfoTypes as BindingTypes,
} from "@ui5-language-assistant/binding-parser";
import { rangeToOffsetRange, typesToValue, valueTypeMap } from "../../../utils";
import { propertyBindingInfoElements } from "../../../definition/definition";
import { BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";

export const checkDependents = (ast: BindingTypes.Ast) => {
  const issues: BindingIssue[] = [];
  // collect all definition which has dependencies
  const dependentElements = propertyBindingInfoElements.filter((item) =>
    item.type.find((i) => i.dependents.length > 0)
  );
  for (const dep of dependentElements) {
    // check if an element which has dependency is used
    const dependentElementApplied = ast.elements.find(
      (item) => item.key?.text === dep.name
    );
    if (dependentElementApplied) {
      // check if its dependency is applied too
      for (const types of dep.type) {
        for (const requiredDep of types.dependents) {
          const requiredDepApplied = ast.elements.find(
            (item) => item.key?.text === requiredDep.name
          );
          if (!requiredDepApplied) {
            issues.push({
              issueType: BINDING_ISSUE_TYPE,
              kind: "RequiredDependency",
              message: `Required dependency "${requiredDep.name}" MUST be defined`,
              offsetRange: rangeToOffsetRange(dependentElementApplied.range),
              range:
                dependentElementApplied.key?.range ??
                dependentElementApplied.range!,
              severity: "info",
            });
          } else {
            // required dependency is applied, check further its value
            for (const requiredDepType of requiredDep.type) {
              switch (requiredDepType.kind) {
                case "string":
                  if (isPrimitiveValue(requiredDepApplied.value)) {
                    const result = valueTypeMap.get(
                      requiredDepApplied.value.type
                    );
                    if (result !== requiredDepType.kind) {
                      const value = typesToValue([requiredDepType]);
                      issues.push({
                        issueType: BINDING_ISSUE_TYPE,
                        kind: "RequiredDependency",
                        message: `Required dependency "${
                          requiredDep.name
                        }" MUST be defined as ${value.join(", ")}`,
                        offsetRange: rangeToOffsetRange(
                          requiredDepApplied.range
                        ),
                        range:
                          requiredDepApplied.key?.range ??
                          requiredDepApplied.range!,
                        severity: "info",
                      });
                    }
                  } else {
                    const value = typesToValue([requiredDepType]);
                    issues.push({
                      issueType: BINDING_ISSUE_TYPE,
                      kind: "RequiredDependency",
                      message: `"${dep.name}" is allowed with "${requiredDep.name}" when "${requiredDep.name}" is defined as ${value[0]}`,
                      offsetRange: rangeToOffsetRange(
                        dependentElementApplied.range
                      ),
                      range:
                        dependentElementApplied.key?.range ??
                        dependentElementApplied.range!,
                      severity: "info",
                    });
                  }
                  break;
                default:
                  break;
              }
            }
          }
        }
      }
    }
  }
  return issues;
};

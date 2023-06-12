import {
  isPrimitiveValue,
  BindingParserTypes as BindingTypes,
} from "@ui5-language-assistant/binding-parser";
import {
  findRange,
  rangeToOffsetRange,
  typesToValue,
  valueTypeMap,
} from "../../../utils";
import { propertyBindingInfoElements } from "../../../definition/definition";
import { BindContext, BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";

export const checkDependents = (
  context: BindContext,
  binding: BindingTypes.StructureValue
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  // collect all definition which has dependencies
  const dependentElements = propertyBindingInfoElements.filter((item) =>
    item.type.find((i) => i.dependents.length > 0)
  );
  for (const dep of dependentElements) {
    // check if an element which has dependency is used
    const dependentElementApplied = binding.elements.find(
      (item) => (item.key && item.key.text) === dep.name
    );
    if (dependentElementApplied) {
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
              message: `Required dependency "${requiredDep.name}" MUST be defined`,
              offsetRange: rangeToOffsetRange(
                findRange([
                  /* istanbul ignore next */
                  dependentElementApplied.key?.range,
                  dependentElementApplied.range,
                ])
              ),
              range: findRange([
                /* istanbul ignore next */
                dependentElementApplied.key?.range,
                dependentElementApplied.range,
              ]),
              severity: "info",
            });
          } else {
            // required dependency is applied, check further its value
            for (const requiredDepType of requiredDep.type) {
              if (requiredDepType.kind === "string") {
                if (isPrimitiveValue(requiredDepApplied.value)) {
                  const result = valueTypeMap.get(
                    requiredDepApplied.value.type
                  );
                  if (result !== requiredDepType.kind) {
                    const value = typesToValue([requiredDepType], context);
                    issues.push({
                      issueType: BINDING_ISSUE_TYPE,
                      kind: "RequiredDependency",
                      message: `Required dependency "${
                        requiredDep.name
                      }" MUST be defined as ${value.join(", ")}`,
                      offsetRange: rangeToOffsetRange(
                        findRange([
                          /* istanbul ignore next */
                          requiredDepApplied.key?.range,
                          requiredDepApplied.range,
                        ])
                      ),
                      range: findRange([
                        /* istanbul ignore next */
                        requiredDepApplied.key?.range,
                        requiredDepApplied.range,
                      ]),
                      severity: "info",
                    });
                  }
                } else {
                  const value = typesToValue([requiredDepType], context);
                  issues.push({
                    issueType: BINDING_ISSUE_TYPE,
                    kind: "RequiredDependency",
                    message: `"${dep.name}" is allowed with "${requiredDep.name}" when "${requiredDep.name}" is defined as ${value[0]}`,
                    offsetRange: rangeToOffsetRange(
                      findRange([
                        /* istanbul ignore next */
                        dependentElementApplied.key?.range,
                        dependentElementApplied.range,
                      ])
                    ),
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
        }
      }
    }
  }
  return issues;
};

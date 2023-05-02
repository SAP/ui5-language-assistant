import { BindingIssue } from "../../../types";
import {
  isCollectionValue,
  isPrimitiveValue,
  isStructureValue,
  PropertyBindingInfoTypes as BindingTypes,
} from "@ui5-language-assistant/binding-parser";
import { checkAst } from "./issue-collector";
import { getPrimitiveValueIssues } from "./check-primitive-value";
import { propertyBindingInfoElements } from "../../../definition/definition";

/**
 * Check collection value
 *
 * @param element an AST element
 * @param ignore flag to ignore checking of key or value
 */
export const checkCollectionValue = (
  element: BindingTypes.AstElement,
  ignore = false
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  const value = element.value;
  if (isCollectionValue(value)) {
    for (const item of value.elements) {
      if (isStructureValue(item)) {
        issues.push(...checkAst(item, true));
      }
      if (isPrimitiveValue(item) && !ignore) {
        const bindingElement = propertyBindingInfoElements.find(
          (el) => el.name === element.key?.text
        );
        issues.push(...getPrimitiveValueIssues(item, bindingElement, true));
      }
    }
  }
  return issues;
};

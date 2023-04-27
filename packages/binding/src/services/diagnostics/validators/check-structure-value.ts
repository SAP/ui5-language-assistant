import { BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";
import {
  isStructureValue,
  PropertyBindingInfoTypes as BindingTypes,
} from "@ui5-language-assistant/binding-parser";
import { checkAst } from "./issue-collector";
import { propertyBindingInfoElements } from "../../../definition/definition";
import { rangeToOffsetRange, typesToValue, valueTypeMap } from "../../../utils";

/**
 * Check structure value
 *
 * @param element AST element
 * @param ignore a flag to ignore if an element is allowed to have structure value
 */
export const checkStructureValue = (
  element: BindingTypes.AstElement,
  ignore = false
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  const value = element.value;
  if (isStructureValue(value)) {
    if (!ignore) {
      // check if that element is allowed to have structure value
      const bindingElement = propertyBindingInfoElements.find(
        (el) => el.name === element.key?.text
      );
      if (!bindingElement) {
        // should have been detected by checkKey
        return issues;
      }
      const elementSpecificType = bindingElement.type.find(
        (i) => i.kind === valueTypeMap.get(BindingTypes.LEFT_CURLY)
      );
      if (!elementSpecificType || elementSpecificType.collection) {
        const data = typesToValue(bindingElement.type);
        const message = `Allowed value${
          data.length > 1 ? "s are" : " is"
        } ${data.join(" or ")}`;
        issues.push({
          issueType: BINDING_ISSUE_TYPE,
          kind: "MissMatchValue",
          message,
          offsetRange: rangeToOffsetRange(value.range),
          range: value.range ?? element.range!,
          severity: "info",
        });
        return issues;
      }
    }

    // check its content - recursive call
    issues.push(...checkAst(value, true));
  }
  return issues;
};

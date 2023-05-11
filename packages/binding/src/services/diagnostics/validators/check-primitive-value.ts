import {
  BindContext,
  BindingIssue,
  BINDING_ISSUE_TYPE,
  PropertyBindingInfoElement,
} from "../../../types";
import {
  isPrimitiveValue,
  PropertyBindingInfoTypes as BindingTypes,
} from "@ui5-language-assistant/binding-parser";
import { rangeToOffsetRange, typesToValue, valueTypeMap } from "../../../utils";
import { propertyBindingInfoElements } from "../../../definition/definition";

export const getPrimitiveValueIssues = (
  context: BindContext,
  item: BindingTypes.PrimitiveValue,
  bindingElement: PropertyBindingInfoElement | undefined,
  collectionValue = false
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  if (!bindingElement) {
    return issues;
  }
  const elementSpecificType = bindingElement.type.find(
    (i) => i.kind === valueTypeMap.get(item.type)
  );
  if (!elementSpecificType) {
    const data = typesToValue(bindingElement.type, context, collectionValue);
    const message = `Allowed value${
      data.length > 1 ? "s are" : " is"
    } ${data.join(" or ")}`;
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "MissMatchValue",
      message,
      offsetRange: rangeToOffsetRange(item.range),
      range: item.range,
      severity: "info",
    });
  }
  return issues;
};

/**
 * Check primitive value
 * @param element an AST element
 * @param ignore a flag to ignore checking of a value
 */
export const checkPrimitiveValue = (
  context: BindContext,
  element: BindingTypes.AstElement,
  ignore = false
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  if (ignore) {
    return issues;
  }
  const value = element.value;
  if (isPrimitiveValue(value)) {
    const bindingElement = propertyBindingInfoElements.find(
      (el) => el.name === element.key?.text
    );
    issues.push(...getPrimitiveValueIssues(context, value, bindingElement));
  }
  return issues;
};

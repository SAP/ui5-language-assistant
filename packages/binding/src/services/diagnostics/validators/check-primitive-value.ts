import {
  BindContext,
  BindingIssue,
  BINDING_ISSUE_TYPE,
  BindingInfoElement,
} from "../../../types";
import {
  isPrimitiveValue,
  BindingParserTypes as BindingTypes,
} from "@ui5-language-assistant/binding-parser";
import { typesToValue, valueTypeMap } from "../../../utils";

/**
 * Get issue for primitive value
 *
 * @param context binding context
 * @param item binding type item
 * @param bindingElement info element
 * @param collectionValue flag which is set as true when inside collection e.g [...<CURSOR>...]
 */
export const getPrimitiveValueIssues = (
  context: BindContext,
  item: BindingTypes.PrimitiveValue,
  bindingElement: BindingInfoElement | undefined,
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
    const data = typesToValue({
      types: bindingElement.type,
      context,
      collectionValue,
      forDiagnostic: true,
    });
    const message = `Allowed value${
      data.length > 1 ? "s are" : " is"
    } ${data.join(" or ")}`;
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "MissMatchValue",
      message,
      range: item.range,
      severity: "error",
    });
  }

  if (
    !collectionValue &&
    elementSpecificType &&
    elementSpecificType.collection
  ) {
    // for a value which is not inside square bracket e.g []. primitive value is used for collection element e.g parts: ''
    const data = typesToValue({
      types: bindingElement.type,
      context,
      collectionValue: false,
      forDiagnostic: true,
    });
    const message = `Allowed value${
      data.length > 1 ? "s are" : " is"
    } ${data.join(" or ")}`;
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "MissMatchValue",
      message,
      range: item.range,
      severity: "error",
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
  element: BindingTypes.StructureElement,
  bindingElements: BindingInfoElement[],
  ignore = false
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  if (ignore) {
    return issues;
  }
  const value = element.value;
  if (isPrimitiveValue(value)) {
    const text = element.key && element.key.text;
    const bindingElement = bindingElements.find((el) => el.name === text);
    issues.push(...getPrimitiveValueIssues(context, value, bindingElement));
  }
  return issues;
};

import { BindContext, BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";
import {
  BindingParserTypes as BindingTypes,
  isPrimitiveValue,
} from "@ui5-language-assistant/binding-parser";
import { getBindingElements } from "../../../definition/definition";
import {
  findRange,
  getPropertyTypeWithPossibleValue,
  valueTypeMap,
} from "../../../utils";

const cleanText = (context: BindContext, text: string): string => {
  const splitKey = context.doubleQuotes ? "'" : '"';
  return text.split(splitKey)[1];
};
export const checkDefaultValue = (
  context: BindContext,
  element: BindingTypes.StructureElement,
  aggregation = false
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  if (!isPrimitiveValue(element.value)) {
    // currently only primitive value has possible value as per definition
    return issues;
  }
  if (valueTypeMap.get(element.value.type) === "boolean") {
    // skip boolean default value
    return issues;
  }
  const text = element.key?.text;
  const bindingElement = getBindingElements(context, aggregation, false).find(
    (el) => el.name === text
  );
  const bindingType = getPropertyTypeWithPossibleValue(element, bindingElement);
  if (bindingType && bindingType.possibleValue?.fixed) {
    const values = bindingType.possibleValue.values;
    if (!values.includes(cleanText(context, element.value.text))) {
      const message = `Allowed value${values.length > 1 ? "s" : ""} ${
        values.length > 1 ? "are" : "is"
      } "${values.join(", ")}"`;
      issues.push({
        issueType: BINDING_ISSUE_TYPE,
        kind: "MissMatchValue",
        message,
        range: findRange([element.value.range, element.range]),
        severity: "error",
      });
    }
  }
  return issues;
};

import {
  BindContext,
  BindingIssue,
  BINDING_ISSUE_TYPE,
  BindingInfoElement,
} from "../../../types";
import {
  BindingParserTypes as BindingTypes,
  isPrimitiveValue,
} from "@ui5-language-assistant/binding-parser";
import {
  findRange,
  getPropertyTypeWithPossibleValue,
  valueTypeMap,
} from "../../../utils";
import { t } from "../../../i18n";

const cleanText = (context: BindContext, text: string): string => {
  const splitKey = context.doubleQuotes ? "'" : '"';
  return text.split(splitKey)[1];
};
export const checkDefaultValue = (
  context: BindContext,
  element: BindingTypes.StructureElement,
  bindingElements: BindingInfoElement[]
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
  const bindingElement = bindingElements.find((el) => el.name === text);
  const bindingType = getPropertyTypeWithPossibleValue(element, bindingElement);
  if (bindingType && bindingType.possibleValue?.fixed) {
    const values = bindingType.possibleValue.values;
    if (!values.includes(cleanText(context, element.value.text))) {
      const message =
        values.length > 1
          ? t("ALLOWED_VALUES_ARE_QUOTES", { data: values.join(t("COMMA")) })
          : t("ALLOWED_VALUES_IS", { data: values.join(t("COMMA")) });
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

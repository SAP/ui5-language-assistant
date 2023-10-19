import {
  BindingParserTypes as BindingTypes,
  isCollectionValue,
  isPrimitiveValue,
  isStructureValue,
} from "@ui5-language-assistant/binding-parser";
import { BindContext, BindingIssue } from "../../../types";
import { checkColon } from "./check-colon";
import { checkMissingValue } from "./check-missing-value";
import { checkComma } from "./check-comma";
import { checkDuplicate } from "./check-duplicate";

/**
 * Check only skeleton conforms to JSON format
 * It checks
 * - colon
 * - missing value
 * - comma
 */
export const checkSkeleton = (
  context: BindContext,
  binding: BindingTypes.StructureValue,
  errors: {
    parse: BindingTypes.ParseError[];
    lexer: BindingTypes.LexerError[];
  }
): BindingIssue[] => {
  const issues: BindingIssue[] = [];

  for (let index = 0; binding.elements.length > index; index++) {
    const element = binding.elements[index];
    const colonIssue: BindingIssue[] = [];
    const missingValueIssue: BindingIssue[] = [];

    colonIssue.push(...checkColon(element, errors));
    issues.push(...colonIssue);

    if (colonIssue.length === 0) {
      missingValueIssue.push(...checkMissingValue(context, element, []));
      issues.push(...missingValueIssue);
    }

    if (missingValueIssue.length > 0) {
      return issues;
    }

    if (isStructureValue(element.value)) {
      issues.push(...checkSkeleton(context, element.value, errors));
    }

    if (isCollectionValue(element.value)) {
      // filter undefined
      const elements = element.value.elements.filter((item) => !!item);
      for (let index = 0; elements.length > index; index++) {
        const item = elements[index];
        const nextItem = elements[index + 1];
        issues.push(
          ...checkComma(item, errors, element.value.commas, nextItem)
        );
        if (isPrimitiveValue(item)) {
          continue;
        }
        issues.push(...checkSkeleton(context, item, errors));
      }
    }
    issues.push(
      ...checkComma(
        element,
        errors,
        binding.commas,
        binding.elements[index + 1]
      )
    );
  }
  issues.push(...checkDuplicate(binding));
  return issues;
};

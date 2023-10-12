import { BindContext, BindingIssue } from "../../../types";
import { BindingParserTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
import { checkKey } from "./check-key";
import { checkColon } from "./check-colon";
import { checkMissingValue } from "./check-missing-value";
import { checkPrimitiveValue } from "./check-primitive-value";
import { checkCollectionValue } from "./check-collection-value";
import { checkStructureValue } from "./check-structure-value";
import { checkDuplicate } from "./check-duplicate";
import { checkNotAllowedElement } from "./check-not-allowed-element";
import { checkDependents } from "./check-dependents";
import { checkNestedParts } from "./check-nested-parts";
import { checkComma } from "./check-comma";
import { checkBrackets } from "./check-brackets";
import { checkDefaultValue } from "./check-default-value";
import { getBindingElements } from "../../../api";
import { isAnyType } from "../../../utils";
import { checkSkeleton } from "./check-skeleton";

/**
 * Check an AST
 *
 * @param element AST element
 * @param ignore flag to ignore checking of key or value
 */
export const checkAst = (
  context: BindContext,
  binding: BindingTypes.StructureValue,
  errors: {
    parse: BindingTypes.ParseError[];
    lexer: BindingTypes.LexerError[];
  },
  aggregation = false,
  bindingElements = getBindingElements(context, aggregation),
  ignore = false
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  if (ignore) {
    // check only skeleton conforms to JSON format
    return checkSkeleton(context, binding, errors);
  }
  for (let index = 0; binding.elements.length > index; index++) {
    const element = binding.elements[index];
    const keyIssue: BindingIssue[] = [];
    const colonIssue: BindingIssue[] = [];
    const missingValueIssue: BindingIssue[] = [];

    keyIssue.push(...checkKey(element, bindingElements, aggregation));
    issues.push(...keyIssue);
    if (keyIssue.length === 0) {
      colonIssue.push(...checkColon(element, errors));
      issues.push(...colonIssue);
    }
    if (colonIssue.length === 0) {
      missingValueIssue.push(
        ...checkMissingValue(context, element, bindingElements)
      );
      issues.push(...missingValueIssue);
    }
    if (missingValueIssue.length === 0) {
      // check any type - any value is allowed
      if (isAnyType(element, bindingElements)) {
        continue;
      }
      issues.push(
        ...checkPrimitiveValue(context, element, bindingElements, ignore)
      );
      issues.push(
        ...checkStructureValue(
          context,
          element,
          errors,
          bindingElements,
          aggregation
        )
      );
      issues.push(
        ...checkCollectionValue(
          context,
          element,
          errors,
          bindingElements,
          aggregation
        )
      );
      issues.push(...checkDefaultValue(context, element, bindingElements));
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
  issues.push(...checkNotAllowedElement(bindingElements, binding));
  issues.push(...checkDependents(bindingElements, binding));
  issues.push(...checkNestedParts(binding));
  issues.push(...checkBrackets(binding));
  return issues;
};

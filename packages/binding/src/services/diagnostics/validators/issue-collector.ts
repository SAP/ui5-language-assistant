import { BindContext, BindingIssue } from "../../../types";
import { PropertyBindingInfoTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
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

/**
 * Check an AST
 *
 * @param element AST element
 * @param ignore flag to ignore checking of key or value
 */
export const checkAst = (
  context: BindContext,
  binding: BindingTypes.Binding,
  errors: {
    parse: BindingTypes.ParseError[];
    lexer: BindingTypes.LexerError[];
  },
  ignore = false
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  for (let index = 0; binding.elements.length > index; index++) {
    const element = binding.elements[index];
    const keyIssue: BindingIssue[] = [];
    const colonIssue: BindingIssue[] = [];
    const missingValueIssue: BindingIssue[] = [];
    if (!ignore) {
      keyIssue.push(...checkKey(element));
      issues.push(...keyIssue);
    }
    if (keyIssue.length === 0) {
      colonIssue.push(...checkColon(element));
      issues.push(...colonIssue);
    }
    if (colonIssue.length === 0) {
      missingValueIssue.push(
        ...checkMissingValue(context, element, errors.parse)
      );
      issues.push(...missingValueIssue);
    }
    if (missingValueIssue.length === 0) {
      issues.push(...checkPrimitiveValue(context, element, ignore));
      issues.push(...checkCollectionValue(context, element, errors, ignore));
      issues.push(...checkStructureValue(context, element, errors, ignore));
    }
    issues.push(
      ...checkComma(element, binding.commas, binding.elements[index + 1])
    );
  }
  issues.push(...checkDuplicate(binding));
  issues.push(...checkNotAllowedElement(binding));
  issues.push(...checkDependents(context, binding));
  issues.push(...checkNestedParts(binding));
  return issues;
};

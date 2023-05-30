import { BindContext, BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";
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
import { rangeToOffsetRange } from "../../../utils";
import { filterParseError } from "../../../utils/expression";

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
    // checking missing comma
    if (!element.comma && binding.elements[index + 1]) {
      const range =
        binding.elements[index + 1].key?.range ??
        binding.elements[index + 1].range;
      issues.push({
        issueType: BINDING_ISSUE_TYPE,
        kind: "MissingComma",
        message: "Missing comma",
        offsetRange: rangeToOffsetRange(range),
        range: range!,
        severity: "info",
      });
    } else if (
      // checking trailing comma
      element.comma?.text === "," &&
      binding.elements[index + 1] === undefined
    ) {
      const range = element.comma.range ?? element.range;
      issues.push({
        issueType: BINDING_ISSUE_TYPE,
        kind: "TrailingComma",
        message: "Trailing comma",
        offsetRange: rangeToOffsetRange(range),
        range: range,
        severity: "info",
      });
    }
  }
  issues.push(...checkDuplicate(binding));
  issues.push(...checkNotAllowedElement(binding));
  issues.push(...checkDependents(context, binding));
  issues.push(...checkNestedParts(binding));
  return issues;
};

/**
 * Check trailing comma.
 *
 * It is considered trailing comma when first merged item is 'RightCurly' or 'RightSquare' and previous token is 'Comma'
 */
export const checkTrailingComma = (ast: BindingTypes.Ast): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  for (const binding of ast.bindings) {
    const parseErrors = filterParseError(binding, ast.errors);
    for (const parseError of parseErrors) {
      const item = parseError.merged[0];
      if (
        parseError.previousToken?.tokenTypeName === BindingTypes.COMMA &&
        (item?.tokenTypeName === BindingTypes.RIGHT_CURLY ||
          item.tokenTypeName === BindingTypes.RIGHT_SQUARE)
      ) {
        // it should have been trailing comma
        issues.push({
          issueType: BINDING_ISSUE_TYPE,
          kind: "TrailingComma",
          message: "Trailing comma",
          offsetRange: rangeToOffsetRange(parseError.previousToken.range),
          range: parseError.previousToken.range,
          severity: "info",
        });
      }
    }
  }
  return issues;
};

import { BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";
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

/**
 * Check an AST
 *
 * @param element AST element
 * @param ignore flag to ignore checking of key or value
 */
export const checkAst = (
  ast: BindingTypes.Ast,
  ignore = false
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  for (const element of ast.elements) {
    const keyIssue: BindingIssue[] = [];
    const colonIssue: BindingIssue[] = [];
    const missingValueIssue: BindingIssue[] = [];
    if (!ignore) {
      keyIssue.push(...checkKey(element));
    }
    issues.push(...keyIssue);
    if (keyIssue.length === 0) {
      colonIssue.push(...checkColon(element));
      issues.push(...colonIssue);
    }
    if (colonIssue.length === 0) {
      missingValueIssue.push(...checkMissingValue(element, ast.errors.parse));
      issues.push(...missingValueIssue);
    }
    if (missingValueIssue.length === 0) {
      issues.push(...checkPrimitiveValue(element, ignore));
      issues.push(...checkCollectionValue(element, ignore));
      issues.push(...checkStructureValue(element, ignore));
    }
  }
  issues.push(...checkDuplicate(ast));
  issues.push(...checkNotAllowedElement(ast));
  issues.push(...checkDependents(ast));
  issues.push(...checkNestedParts(ast));
  return issues;
};

/**
 * Check missing comma.
 *
 * It is considered missing comma, when first merged token is key and there is a previous token
 */
export const checkMissingComma = (ast: BindingTypes.Ast): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  const parseErrors = ast.errors.parse;
  for (const parseError of parseErrors) {
    const item = parseError.merged[0];
    if (parseError.previousToken && item?.tokenTypeName === BindingTypes.KEY) {
      // it should have been missing comma
      issues.push({
        issueType: BINDING_ISSUE_TYPE,
        kind: "MissingComma",
        message: "Missing comma",
        offsetRange: rangeToOffsetRange(item.range),
        range: item.range!,
        severity: "info",
      });
    }
  }
  return issues;
};

/**
 * Check trailing comma.
 *
 * It is considered trailing comma when first merged item is 'RightCurly' and previous token is 'Comma'
 */
export const checkTrailingComma = (ast: BindingTypes.Ast): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  const parseErrors = ast.errors.parse;
  for (const parseError of parseErrors) {
    const item = parseError.merged[0];
    if (
      parseError.previousToken?.tokenTypeName === BindingTypes.COMMA &&
      item?.tokenTypeName === BindingTypes.RIGHT_CURLY
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
  return issues;
};

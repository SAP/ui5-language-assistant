import { XMLAttribute } from "@xml-tools/ast";
import { Context } from "@ui5-language-assistant/context";
import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";
import { BindingIssue } from "../../../types";
import { BINDING_ISSUE_TYPE } from "../../../constant";
import {
  extractBindingExpression,
  isBindingExpression,
  isPropertyBindingInfo,
  rangeToOffsetRange,
} from "../../../utils";
import { Position } from "vscode-languageserver-types";
import { parsePropertyBindingInfo } from "@ui5-language-assistant/binding-parser";
import {
  checkAst,
  checkMissingComma,
  checkTrailingComma,
} from "./issue-collector";

export function validatePropertyBindingInfo(
  attribute: XMLAttribute,
  context: Context & { doubleQuotes?: boolean }
): BindingIssue[] {
  const issues: BindingIssue[] = [];
  try {
    const ui5Property = getUI5PropertyByXMLAttributeKey(
      attribute,
      context.ui5Model
    );
    if (!ui5Property) {
      return [];
    }

    const value = attribute.syntax.value;
    const text = attribute.value ?? "";
    const startChar = value?.image.charAt(0);
    context.doubleQuotes = startChar === '"';
    if (text.trim().length === 0) {
      return [];
    }
    const { expression, startIndex } = extractBindingExpression(text);
    if (!isPropertyBindingInfo(expression)) {
      return [];
    }
    if (isBindingExpression(expression)) {
      return [];
    }
    const position: Position = {
      character: (value?.startColumn ?? 0) + startIndex,
      line: value?.startLine ? value.startLine - 1 : 0, // zero based index
    };
    const { ast } = parsePropertyBindingInfo(expression, position);
    issues.push(...checkAst(context, ast));
    issues.push(...checkMissingComma(ast));
    issues.push(...checkTrailingComma(ast));
    /**
     * Show all lexer errors
     */
    for (const item of ast.errors.lexer) {
      issues.push({
        issueType: BINDING_ISSUE_TYPE,
        kind: "UnknownChar",
        message: "Unknown character",
        range: item.range,
        severity: "info",
        offsetRange: rangeToOffsetRange(item.range),
      });
    }
    /**
     * Show only one syntax error at a time only where there is no other issue
     */
    if (issues.length === 0 && ast.errors.parse.length) {
      const item = ast.errors.parse[0];
      issues.push({
        issueType: BINDING_ISSUE_TYPE,
        kind: "Syntax",
        message: item.message,
        range: item.range,
        severity: "info",
        offsetRange: rangeToOffsetRange(item.range),
      });
    }
    return issues;
  } catch (error) {
    return issues;
  }
}

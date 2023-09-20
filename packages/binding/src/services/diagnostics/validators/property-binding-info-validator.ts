import { XMLAttribute } from "@xml-tools/ast";
import { Context } from "@ui5-language-assistant/context";
import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";
import { BindingIssue } from "../../../types";
import { BINDING_ISSUE_TYPE, PROPERTY_BINDING_INFO } from "../../../constant";
import { getLogger } from "../../../utils";
import { Position } from "vscode-languageserver-types";
import {
  parseBinding,
  isBindingAllowed,
  isBindingExpression,
  extractBindingSyntax,
} from "@ui5-language-assistant/binding-parser";
import { checkAst } from "./issue-collector";
import { filterLexerError, filterParseError } from "../../../utils/expression";

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
    const propBinding = context.ui5Model.typedefs[PROPERTY_BINDING_INFO];
    const properties = propBinding.properties.map((i) => i.name);
    const value = attribute.syntax.value;
    const text = attribute.value ?? "";
    const startChar = value?.image.charAt(0);
    context.doubleQuotes = startChar === '"';
    if (text.trim().length === 0) {
      return [];
    }

    const extractedText = extractBindingSyntax(text);
    for (const bindingSyntax of extractedText) {
      const { expression, startIndex } = bindingSyntax;
      if (isBindingExpression(expression)) {
        continue;
      }
      /* istanbul ignore next */
      const position: Position = {
        character: (value?.startColumn ?? 0) + startIndex,
        line: value?.startLine ? value.startLine - 1 : 0, // zero based index
      };
      const { ast, errors } = parseBinding(expression, position);
      for (const binding of ast.bindings) {
        if (!isBindingAllowed(expression, binding, errors, properties)) {
          continue;
        }

        issues.push(...checkAst(context, binding, errors));

        /**
         * Show all lexer errors
         */
        for (const item of filterLexerError(binding, errors)) {
          if (binding.elements.length === 0) {
            return issues;
          }
          issues.push({
            issueType: BINDING_ISSUE_TYPE,
            kind: "UnknownChar",
            message: "Unknown character",
            range: item.range,
            severity: "error",
          });
        }
        /**
         * Show only one syntax error at a time only when there is no other issue
         */
        const parseError = filterParseError(binding, errors);
        if (issues.length === 0 && parseError.length) {
          const item = parseError[0];
          issues.push({
            issueType: BINDING_ISSUE_TYPE,
            kind: "Syntax",
            message: item.message,
            range: item.range,
            severity: "error",
          });
        }
      }
    }
    getLogger().trace("computed diagnostics", { diagnostics: issues });
    return issues;
  } catch (error) {
    getLogger().debug("validatePropertyBindingInfo failed:", error);
    return issues;
  }
}

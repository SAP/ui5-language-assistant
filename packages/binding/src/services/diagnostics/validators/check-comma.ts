import { BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";
import {
  isBefore,
  BindingParserTypes as BindingTypes,
} from "@ui5-language-assistant/binding-parser";
import { Range } from "vscode-languageserver-types";
import { findRange } from "../../../utils";
import { filterTooManyColon } from "./check-colon";
import { t } from "../../../i18n";

/**
 * Check comma
 */
export const checkComma = (
  item:
    | BindingTypes.StructureElement
    | BindingTypes.PrimitiveValue
    | BindingTypes.StructureValue,
  errors: {
    parse: BindingTypes.ParseError[];
    lexer: BindingTypes.LexerError[];
  },
  /* istanbul ignore next */
  comma: BindingTypes.Comma[] = [],
  nextItem?:
    | BindingTypes.StructureElement
    | BindingTypes.PrimitiveValue
    | BindingTypes.StructureValue
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  // check too many colon - no comma issue in case of too many colon
  const tooManyColon = filterTooManyColon(item, errors);
  if (tooManyColon.length > 0) {
    return issues;
  }
  const commas = comma.filter((comma) => {
    if (item.range && item.range.end && comma.range.start) {
      if (nextItem && nextItem.range && nextItem.range.start) {
        return (
          isBefore(item.range.end, comma.range.start, true) &&
          isBefore(comma.range.start, nextItem.range.start, true)
        );
      }
    }
    return (
      item.range &&
      item.range.end &&
      isBefore(item.range.end, comma.range.start, true)
    );
  });
  if (commas.length === 0 && nextItem) {
    // missing comma
    const range = nextItem.range;
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "MissingComma",
      message: t("MISSING_COMMA"),
      range: findRange([range]),
      severity: "error",
    });
  }
  if (commas.length > 1 && nextItem) {
    // too many commas
    const comma = commas.slice(1);
    const first = comma[0];
    const last = comma[comma.length - 1];
    const range = Range.create(first.range.start, last.range.end);
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "TooManyCommas",
      message: t("TOO_MANY_COMMAS"),
      range: range,
      severity: "error",
    });
  }
  if (commas.length >= 1 && nextItem === undefined) {
    // Trailing commas
    const first = commas[0];
    const last = commas[commas.length - 1];
    const range = Range.create(first.range.start, last.range.end);
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "TrailingComma",
      message: t("TRAILING_COMMA"),
      range: range,
      severity: "error",
    });
  }
  return issues;
};

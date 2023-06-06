import { BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";
import {
  isBefore,
  PropertyBindingInfoTypes as BindingTypes,
  rangeContained,
  COLON,
} from "@ui5-language-assistant/binding-parser";
import { rangeToOffsetRange } from "../../../utils/document";
import { Range } from "vscode-languageserver-types";

/**
 * Check comma
 */
export const checkComma = (
  item: BindingTypes.AstElement,
  /* istanbul ignore next */
  comma: BindingTypes.Comma[] = [],
  errors: {
    parse: BindingTypes.ParseError[];
    lexer: BindingTypes.LexerError[];
  },
  nextItem?: BindingTypes.AstElement
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  // check too many colon - no comma issue in case of too many colon
  const tooManyColon = errors.parse
    .filter(
      (i) =>
        i.tokenTypeName === COLON &&
        i.previousToken &&
        i.previousToken.tokenTypeName === COLON
    )
    .find(
      (i) =>
        item.colon &&
        item.colon.range &&
        i.previousToken &&
        rangeContained(
          { start: i.previousToken.range.start, end: i.range.end },
          item.colon.range,
          true
        )
    );
  if (tooManyColon) {
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
      message: "Missing comma",
      offsetRange: rangeToOffsetRange(range),
      range: range,
      severity: "info",
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
      message: "Too many commas",
      offsetRange: rangeToOffsetRange(range),
      range: range,
      severity: "info",
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
      message: "Trailing comma",
      offsetRange: rangeToOffsetRange(range),
      range: range,
      severity: "info",
    });
  }
  return issues;
};

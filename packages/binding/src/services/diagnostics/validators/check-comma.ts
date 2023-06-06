import { BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";
import {
  isBefore,
  PropertyBindingInfoTypes as BindingTypes,
} from "@ui5-language-assistant/binding-parser";
import { rangeToOffsetRange } from "../../../utils/document";
import { Range } from "vscode-languageserver-types";
/**
 * Check comma
 */
export const checkComma = (
  item: BindingTypes.AstElement,
  comma: BindingTypes.Comma[] = [],
  nextItem?: BindingTypes.AstElement
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  const commas = comma.filter((comma) => {
    if (item.range?.end && comma.range.start) {
      if (nextItem && nextItem.range?.start) {
        return (
          isBefore(item.range.end, comma.range.start, true) &&
          isBefore(comma.range.start, nextItem.range.start, true)
        );
      }
      return isBefore(item.range.end, comma.range.start, true);
    }
    return false;
  });
  if (commas.length === 0 && nextItem) {
    // missing comma
    const range = nextItem.range;
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "MissingComma",
      message: "Missing comma",
      offsetRange: rangeToOffsetRange(range),
      range: range!,
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

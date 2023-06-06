import { BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";
import {
  COLON,
  PropertyBindingInfoTypes as BindingTypes,
  rangeContained,
} from "@ui5-language-assistant/binding-parser";
import { rangeToOffsetRange } from "../../../utils/document";
/**
 * Check colon
 */
export const checkColon = (
  element: BindingTypes.AstElement,
  errors: {
    parse: BindingTypes.ParseError[];
    lexer: BindingTypes.LexerError[];
  }
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  if (!element.key) {
    return issues;
  }
  const tooManyColon = errors.parse
    .filter(
      (i) =>
        i.tokenTypeName === COLON &&
        i.previousToken &&
        i.previousToken.tokenTypeName === COLON
    )
    .filter(
      (i) =>
        element.colon &&
        element.colon.range &&
        i.previousToken &&
        rangeContained(
          { start: i.previousToken.range.start, end: i.range.end },
          element.colon.range,
          true
        )
    );
  if (tooManyColon.length > 0) {
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "TooManyColons",
      message: "Too many colon",
      offsetRange: rangeToOffsetRange(tooManyColon[0].range),
      range: tooManyColon[0].range,
      severity: "info",
    });
  }
  if (!element.colon || (element.colon && element.colon.text === "")) {
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "MissingColon",
      message: "Expect colon",
      offsetRange: rangeToOffsetRange(element.key.range),
      range: element.key.range,
      severity: "info",
    });
  }
  return issues;
};

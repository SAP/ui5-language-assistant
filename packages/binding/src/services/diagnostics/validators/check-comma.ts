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
  commas: BindingTypes.Comma[] = [],
  nextItem?:
    | BindingTypes.StructureElement
    | BindingTypes.PrimitiveValue
    | BindingTypes.StructureValue
    | BindingTypes.CollectionValue
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  // check too many colon - no comma issue in case of too many colon
  const tooManyColon = filterTooManyColon(item, errors);
  if (tooManyColon.length > 0) {
    return issues;
  }
  const allCommas = commas.filter((comma) => {
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
  if (allCommas.length === 0 && nextItem) {
    // missing comma
    let range: Range | undefined;
    switch (nextItem.type) {
      case "structure-element":
        range = nextItem.key?.range;
        break;
      case "structure-value":
        range = nextItem.leftCurly?.range;
        break;
      case "collection-value":
        range = nextItem.leftSquare?.range;
        break;
      default:
        range = nextItem.range;
        break;
    }
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "MissingComma",
      message: t("MISSING_COMMA"),
      range: findRange([range]),
      severity: "error",
    });
  }
  if (allCommas.length > 1 && nextItem) {
    // too many commas
    const comma = allCommas.slice(1);
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
  if (allCommas.length >= 1 && nextItem === undefined) {
    // Trailing commas
    const first = allCommas[0];
    const last = allCommas[allCommas.length - 1];
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

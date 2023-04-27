import type { OffsetRange } from "@ui5-language-assistant/logic-utils";
import type { Range } from "vscode-languageserver-types";

export const rangeToOffsetRange = (range?: Range): OffsetRange => {
  if (!range) {
    return { start: 0, end: 0 };
  }
  return { start: range.start.character, end: range.end.character };
};

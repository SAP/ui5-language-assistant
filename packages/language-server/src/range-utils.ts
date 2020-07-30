import { TextDocument } from "vscode-languageserver";
import { Range as LSPRange } from "vscode-languageserver-types";
import { OffsetRange } from "@ui5-language-assistant/xml-views-validation";

export function LSPRangeToOffsetRange(
  LSPRange: LSPRange,
  document: TextDocument
): OffsetRange {
  return {
    start: document.offsetAt(LSPRange.start),
    // Chevrotain's end offsets are none inclusive
    end: document.offsetAt(LSPRange.end) - 1,
  };
}

export function offsetRangeToLSPRange(
  offsetRange: OffsetRange,
  document: TextDocument
): LSPRange {
  return {
    start: document.positionAt(offsetRange.start),
    // Chevrotain's end offsets are none inclusive
    end: document.positionAt(offsetRange.end + 1),
  };
}

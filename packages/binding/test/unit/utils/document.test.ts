import { Range } from "vscode-languageserver-types";
import { rangeToOffsetRange } from "../../../src/utils";

describe("document", () => {
  describe("rangeToOffsetRange", () => {
    it("undefined", () => {
      const result = rangeToOffsetRange();
      expect(result).toStrictEqual({ start: 0, end: 0 });
    });
    it("result", () => {
      const range: Range = Range.create(
        { line: 0, character: 1 },
        { line: 0, character: 5 }
      );
      const result = rangeToOffsetRange(range);
      expect(result).toStrictEqual({ start: 1, end: 5 });
    });
  });
});

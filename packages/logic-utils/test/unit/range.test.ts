import { locationToRange } from "../../src/api";
import { CstNodeLocation } from "chevrotain";

describe("locationToRange", () => {
  it("should return a Range object with start and end positions set", () => {
    // arrange
    const location = {
      startLine: 1,
      startColumn: 1,
      endLine: 2,
      endColumn: 2,
    } as CstNodeLocation;
    // act
    const result = locationToRange(location);
    // assert
    expect(result).toStrictEqual({
      start: { line: 0, character: 0 },
      end: { line: 1, character: 2 },
    });
  });

  it("should return a Range object with default positions when location is undefined", () => {
    // act
    const result = locationToRange(undefined);
    // assert
    expect(result).toStrictEqual({
      start: { line: 0, character: 0 },
      end: { line: 0, character: 0 },
    });
  });

  it("should return a Range object with adjusted start and end positions when some properties are undefined", () => {
    // arrange
    const location = {
      startLine: 5,
      startColumn: 10,
    } as CstNodeLocation;

    // act
    const result = locationToRange(location);
    // assert
    expect(result).toStrictEqual({
      start: { line: 4, character: 9 },
      end: { line: 0, character: 0 },
    });
  });
});

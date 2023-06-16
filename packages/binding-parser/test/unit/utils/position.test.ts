import {
  isBefore,
  isBeforeAdjacentRange,
  isAfterAdjacentRange,
  positionContained,
  rangeContained,
} from "../../../src/api";
import { Range, Position } from "vscode-languageserver-protocol";
describe("position", () => {
  describe("rangeContained", () => {
    it("true", () => {
      const a: Range = {
        start: {
          line: 1,
          character: 2,
        },
        end: {
          line: 1,
          character: 20,
        },
      };
      const b: Range = {
        start: {
          line: 1,
          character: 5,
        },
        end: {
          line: 1,
          character: 15,
        },
      };
      const result = rangeContained(a, b);
      expect(result).toBeTrue();
    });
    it("false", () => {
      const a: Range = {
        start: {
          line: 1,
          character: 2,
        },
        end: {
          line: 1,
          character: 20,
        },
      };
      const b: Range = {
        start: {
          line: 1,
          character: 5,
        },
        end: {
          line: 1,
          character: 15,
        },
      };
      const result = rangeContained(b, a);
      expect(result).toBeFalse();
    });
  });
  describe("positionContained", () => {
    it("false [range undefined]", () => {
      const p: Position = {
        character: 5,
        line: 0,
      };
      const result = positionContained(undefined, p);
      expect(result).toBeFalse();
    });
    it("false", () => {
      const range: Range = {
        start: {
          line: 1,
          character: 2,
        },
        end: {
          line: 1,
          character: 20,
        },
      };
      const p: Position = {
        character: 50,
        line: 1,
      };
      const result = positionContained(range, p);
      expect(result).toBeFalse();
    });
    it("true", () => {
      const range: Range = {
        start: {
          line: 1,
          character: 2,
        },
        end: {
          line: 1,
          character: 20,
        },
      };
      const p: Position = {
        character: 5,
        line: 1,
      };
      const result = positionContained(range, p);
      expect(result).toBeTrue();
    });
  });
  describe("isBefore", () => {
    it("true [pos1.line < pos2.line]", () => {
      const pos1: Position = {
        character: 5,
        line: 0,
      };
      const pos2: Position = {
        character: 5,
        line: 1,
      };
      const result = isBefore(pos1, pos2);
      expect(result).toBeTrue();
    });
    it("false [pos1.line > pos2.line]", () => {
      const pos1: Position = {
        character: 5,
        line: 1,
      };
      const pos2: Position = {
        character: 5,
        line: 0,
      };
      const result = isBefore(pos1, pos2);
      expect(result).toBeFalse();
    });
    it("includeEqual = true", () => {
      const pos1: Position = {
        character: 5,
        line: 0,
      };
      const pos2: Position = {
        character: 5,
        line: 0,
      };
      const result = isBefore(pos1, pos2, true);
      expect(result).toBeTrue();
    });
    it("pos1.character < pos2.character", () => {
      const pos1: Position = {
        character: 5,
        line: 0,
      };
      const pos2: Position = {
        character: 6,
        line: 0,
      };
      const result = isBefore(pos1, pos2, true);
      expect(result).toBeTrue();
    });
  });
  describe("isBeforeAdjacentRange", () => {
    it("false [range1 undefined]", () => {
      const result = isBeforeAdjacentRange(undefined, {} as Range);
      expect(result).toBeFalse();
    });
    it("false [range2 undefined]", () => {
      const result = isBeforeAdjacentRange({} as Range);
      expect(result).toBeFalse();
    });
    it("true [range1.end.line === range2.start.line && range1.end.character === range2.start.character]", () => {
      const range1: Range = {
        start: {
          line: 5,
          character: 2,
        },
        end: {
          line: 5,
          character: 6,
        },
      };
      const range2: Range = {
        start: {
          line: 5,
          character: 6,
        },
        end: {
          line: 5,
          character: 10,
        },
      };
      const result = isBeforeAdjacentRange(range1, range2);
      expect(result).toBeTrue();
    });
    it("false", () => {
      const range1: Range = {
        start: {
          line: 5,
          character: 6,
        },
        end: {
          line: 5,
          character: 10,
        },
      };
      const range2: Range = {
        start: {
          line: 5,
          character: 2,
        },
        end: {
          line: 5,
          character: 6,
        },
      };
      const result = isBeforeAdjacentRange(range1, range2);
      expect(result).toBeFalse();
    });
  });
  describe("isAfterAdjacentRange", () => {
    it("false [range1 undefined]", () => {
      const result = isAfterAdjacentRange(undefined, {} as Range);
      expect(result).toBeFalse();
    });
    it("false [range2 undefined]", () => {
      const result = isAfterAdjacentRange({} as Range, undefined);
      expect(result).toBeFalse();
    });
    it("true [range1.start.line === range2.end.line && range1.start.character === range2.end.character]", () => {
      const range1: Range = {
        start: {
          line: 5,
          character: 6,
        },
        end: {
          line: 5,
          character: 10,
        },
      };
      const range2: Range = {
        start: {
          line: 5,
          character: 2,
        },
        end: {
          line: 5,
          character: 6,
        },
      };
      const result = isAfterAdjacentRange(range1, range2);
      expect(result).toBeTrue();
    });
    it("false", () => {
      const range1: Range = {
        start: {
          line: 5,
          character: 2,
        },
        end: {
          line: 5,
          character: 6,
        },
      };
      const range2: Range = {
        start: {
          line: 5,
          character: 6,
        },
        end: {
          line: 5,
          character: 10,
        },
      };
      const result = isAfterAdjacentRange(range1, range2);
      expect(result).toBeFalse();
    });
  });
});

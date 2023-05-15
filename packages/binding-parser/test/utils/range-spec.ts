import { expect } from "chai";
import { IToken, CstNodeLocation } from "chevrotain";
import { getRange, locationToRange } from "../../src/utils/range";
import type { Position } from "vscode-languageserver-types";

interface CreateParam {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}
const createToken = <T>(param: CreateParam): T => {
  return {
    ...param,
  } as T;
};

describe("range", () => {
  context("getRange", () => {
    it("without position param", () => {
      const token = createToken<IToken>({
        startColumn: 10,
        startLine: 5,
        endColumn: 22,
        endLine: 7,
      });
      const range = getRange(token);
      expect(range).to.deep.equal({
        start: {
          line: 4,
          character: 9,
        },
        end: {
          line: 6,
          character: 22,
        },
      });
    });
    it("with position param", () => {
      const token = createToken<IToken>({
        startColumn: 6,
        startLine: 2,
        endColumn: 9,
        endLine: 2,
      });
      const position: Position = {
        line: 9,
        character: 19,
      };
      const range = getRange(token, position);
      expect(range).to.deep.equal({
        start: {
          line: 10,
          character: 5,
        },
        end: {
          line: 10,
          character: 9,
        },
      });
    });
  });
  context("locationToRange", () => {
    it("without position param", () => {
      const token = createToken<CstNodeLocation>({
        startColumn: 10,
        startLine: 5,
        endColumn: 22,
        endLine: 7,
      });
      const range = locationToRange(token);
      expect(range).to.deep.equal({
        start: {
          line: 4,
          character: 9,
        },
        end: {
          line: 6,
          character: 22,
        },
      });
    });
    it("with position param", () => {
      const token = createToken<CstNodeLocation>({
        startColumn: 6,
        startLine: 2,
        endColumn: 9,
        endLine: 2,
      });
      const position: Position = {
        line: 9,
        character: 19,
      };
      const range = locationToRange(token, position);
      expect(range).to.deep.equal({
        start: {
          line: 10,
          character: 5,
        },
        end: {
          line: 10,
          character: 9,
        },
      });
    });
  });
});

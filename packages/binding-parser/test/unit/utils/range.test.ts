import { IToken, CstNodeLocation, ILexingError } from "chevrotain";
import {
  getRange,
  locationToRange,
  getLexerRange,
} from "../../../src/utils/range";
import type { Position } from "vscode-languageserver-types";

interface CreateParam {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}
const createToken = <T, U = CreateParam>(param: U): T => {
  return {
    ...param,
  } as unknown as T;
};

describe("range", () => {
  describe("getRange", () => {
    it("without position param", () => {
      const token = createToken<IToken>({
        startColumn: 10,
        startLine: 5,
        endColumn: 22,
        endLine: 7,
      });
      const range = getRange(token);
      expect(range).toStrictEqual({
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
      const range = getRange(token, { position });
      expect(range).toStrictEqual({
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
  describe("locationToRange", () => {
    it("missing location", () => {
      const range = locationToRange();
      expect(range).toBeUndefined();
    });
    it("without position param", () => {
      const token = createToken<CstNodeLocation>({
        startColumn: 10,
        startLine: 5,
        endColumn: 22,
        endLine: 7,
      });
      const range = locationToRange(token);
      expect(range).toStrictEqual({
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
      const range = locationToRange(token, { position });
      expect(range).toStrictEqual({
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
    it("with NaN", () => {
      const token = createToken<CstNodeLocation>({
        startColumn: NaN,
        startLine: NaN,
        endColumn: NaN,
        endLine: NaN,
      });
      const range = locationToRange(token);
      expect(range).toStrictEqual({
        start: {
          line: 0,
          character: 0,
        },
        end: {
          line: 0,
          character: 0,
        },
      });
    });
  });
  describe("getLexerRange", () => {
    it("without position param", () => {
      const create: ILexingError = {
        line: 5,
        column: 4,
        length: 9,
        message: "",
        offset: 50,
      };
      const token = createToken<ILexingError, ILexingError>(create);
      const range = getLexerRange(token);
      expect(range).toStrictEqual({
        start: {
          line: 4,
          character: 3,
        },
        end: {
          line: 4,
          character: 12,
        },
      });
    });
    it("with position param", () => {
      const create: ILexingError = {
        line: 5,
        column: 4,
        length: 9,
        message: "",
        offset: 50,
      };
      const token = createToken<ILexingError, ILexingError>(create);
      const position: Position = {
        line: 9,
        character: 19,
      };
      const range = getLexerRange(token, position);
      expect(range).toStrictEqual({
        start: {
          line: 13,
          character: 3,
        },
        end: {
          line: 13,
          character: 12,
        },
      });
    });
    it("with NaN", () => {
      const create: ILexingError = {
        line: NaN,
        column: NaN,
        length: 0,
        message: "",
        offset: NaN,
      };
      const token = createToken<ILexingError, ILexingError>(create);
      const range = getLexerRange(token);
      expect(range).toStrictEqual({
        start: {
          line: 0,
          character: 0,
        },
        end: {
          line: 0,
          character: 0,
        },
      });
    });
  });
});

import { IToken, CstNodeLocation } from "chevrotain";
import type { Position, Range } from "vscode-languageserver-types";
export const getRange = (token: IToken, position?: Position): Range => {
  if (position) {
    const start = {
      line: token.startLine
        ? token.startLine - 1 + position.line
        : position.line,
      character: token.startColumn
        ? token.startColumn -
          1 +
          (token.startLine && token.startLine > 1 ? 0 : position.character)
        : position.character,
    };
    const end = {
      line: token.endLine ? position.line + (token.endLine - 1) : position.line,
      character: token.endColumn
        ? token.endColumn +
          (token.endLine && token.endLine > 1 ? 0 : position.character)
        : position.character,
    };
    return {
      start,
      end,
    };
  }
  return {
    start: {
      line: token.startLine ? token.startLine - 1 : 0,
      character: token.startColumn ? token.startColumn - 1 : 0,
    },
    end: {
      line: token.endLine ? token.endLine - 1 : 0,
      character: token.endColumn ?? 0,
    },
  };
};
export const locationToRange = (
  location?: CstNodeLocation,
  position?: Position
): Range | undefined => {
  if (!location) {
    return;
  }
  if (position) {
    const start = {
      line: location.startLine
        ? location.startLine - 1 + position.line
        : position.line,
      character: location.startColumn
        ? location.startColumn - 1 + position.character
        : position.character,
    };
    return {
      start,
      end: {
        line: location.endLine
          ? position.line + (location.endLine - 1)
          : position.line,
        character: location.endColumn
          ? location.endColumn + position.character
          : position.character,
      },
    };
  }
  return {
    start: {
      line: location.startLine ? location.startLine - 1 : 0,
      character: location.startColumn ? location.startColumn - 1 : 0,
    },
    end: {
      line: location.endLine ? location.endLine - 1 : 0,
      character: location.endColumn ?? 0, // maybe plus 1?
    },
  };
};

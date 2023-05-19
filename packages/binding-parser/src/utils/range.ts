import { IToken, CstNodeLocation, ILexingError } from "chevrotain";
import { Offset, VisitorParam } from "../types/property-binding-info";
import { Position, Range } from "vscode-languageserver-types";
import { isBefore, isBeforeOffset, rangeContained } from "./position";

const hasNaNOrUndefined = (value: undefined | number): boolean => {
  if (value === undefined) {
    return true;
  }
  return isNaN(value);
};
const adjustPosition = (position: Position, offset: Position): Position =>
  Position.create(
    position.line + offset.line,
    position.line === 0
      ? position.character + offset.character
      : position.character
  );

const adjustOffset = (range: Range, offset: number): Range => {
  // const offsetDif = offset.end - offset.start;
  if (range.start.line !== range.end.line) {
    // if line difference, adapt start not end
    return Range.create(
      {
        line: range.start.line,
        character: offset + range.start.character,
      },
      range.end
    );
  }
  return Range.create(
    {
      line: range.start.line,
      character: offset + range.start.character,
    },
    {
      line: range.end.line,
      character: offset + range.end.character,
    }
  );
};

export const getLexerRange = (
  node: ILexingError,
  startPosition?: Position
): Range => {
  const startLine = hasNaNOrUndefined(node.line) ? 0 : node.line! - 1;
  const startChar = hasNaNOrUndefined(node.column) ? 0 : node.column! - 1;
  const start = Position.create(startLine, startChar);

  const endLine = hasNaNOrUndefined(node.line) ? 0 : node.line! - 1;
  const endChar = startChar + node.length;
  const end = Position.create(endLine, endChar);
  if (startPosition) {
    return Range.create(
      adjustPosition(start, startPosition),
      adjustPosition(end, startPosition)
    );
  }

  return Range.create(start, end);
};
export const getLexerOffset = (
  node: ILexingError,
  startPosition?: Position
): Offset => {
  const start = node.offset;
  const end = node.length;
  if (startPosition) {
    return {
      start: start + startPosition.character,
      end: start + end,
    };
  }

  return {
    start,
    end: start + end,
  };
};

export const getRange = (token: IToken, param?: VisitorParam): Range => {
  const startPosition = param?.position;
  const lexer = param?.errors?.lexer ?? [];
  const parse = param?.errors?.parse ?? [];

  const start = Position.create(
    hasNaNOrUndefined(token.startLine) ? 0 : token.startLine! - 1,
    hasNaNOrUndefined(token.startColumn) ? 0 : token.startColumn! - 1
  );
  const line = hasNaNOrUndefined(token.endLine) ? 0 : token.endLine! - 1;

  const char = hasNaNOrUndefined(token.endColumn) ? 0 : token.endColumn!;

  const end = Position.create(line, char);
  let range: Range;
  if (startPosition) {
    range = Range.create(
      adjustPosition(start, startPosition),
      adjustPosition(end, startPosition)
    );
  } else {
    range = Range.create(start, end);
  }
  const offset = getOffset(token, param);
  const lexerFiltered = lexer
    .filter((item) => isBeforeOffset(item.offset, offset))
    .filter((item) => item.range.start.line === range.start.line);

  const diff = lexerFiltered.reduce((previous, current) => {
    return previous + current.offset.end - current.offset.start;
  }, 0);
  range = adjustOffset(range, diff);
  return range;
};
export const getOffset = (
  token?: IToken | CstNodeLocation,
  param?: VisitorParam
): Offset => {
  if (!token) {
    return {
      start: 0,
      end: 0,
    };
  }
  const startPosition = param?.position;
  if (startPosition) {
    return {
      start: hasNaNOrUndefined(token.startOffset)
        ? 0
        : token.startOffset + startPosition.character,
      end: hasNaNOrUndefined(token.endOffset) ? 0 : token.endOffset! + 1,
    };
  }

  return {
    start: hasNaNOrUndefined(token.startOffset) ? 0 : token.startOffset,
    end: hasNaNOrUndefined(token.endOffset) ? 0 : token.endOffset! + 1,
  };
};

export const locationToRange = (
  location?: CstNodeLocation,
  param?: VisitorParam
): Range | undefined => {
  if (!location) {
    return;
  }
  const startPosition = param?.position;
  const lexer = param?.errors?.lexer ?? [];
  const parse = param?.errors?.parse ?? [];
  let range = Range.create(
    hasNaNOrUndefined(location.startLine) ? 0 : location.startLine! - 1,
    hasNaNOrUndefined(location.startColumn) ? 0 : location.startColumn! - 1,
    hasNaNOrUndefined(location.endLine) ? 0 : location.endLine! - 1,
    hasNaNOrUndefined(location.endColumn) ? 0 : location.endColumn!
  );
  if (startPosition) {
    range = Range.create(
      adjustPosition(range.start, startPosition),
      adjustPosition(range.end, startPosition)
    );
  }
  const offset = getOffset(location, param);
  let lexerFiltered = lexer.filter((item) =>
    isBeforeOffset(item.offset, offset)
  );
  lexerFiltered = lexerFiltered.filter(
    (item) => item.range.start.line === range.start.line
  );

  const diff = lexerFiltered.reduce((previous, current) => {
    return previous + current.offset.end - current.offset.start;
  }, 0);
  range = adjustOffset(range, diff);
  return range;
};
// export const locationToOffset = (
//   location?: CstNodeLocation,
//   startPosition?: Position
// ): Offset | undefined => {
//   if (!location) {
//     return;
//   }
//   const offset = {
//     start: hasNaNOrUndefined(location.startOffset) ? 0 : location.startOffset,
//     end: hasNaNOrUndefined(location.endOffset) ? 0 : location.endOffset! + 1,
//   };
//   if (startPosition) {
//     return {
//       ...offset,
//       start: offset.start + startPosition.character,
//     };
//   }

//   return offset;
// };

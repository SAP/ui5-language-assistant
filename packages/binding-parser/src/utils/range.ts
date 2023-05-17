import { IToken, CstNodeLocation, ILexingError } from "chevrotain";
import { Position, Range } from "vscode-languageserver-types";
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

export const getLexerRange = (
  node: ILexingError,
  startPosition?: Position
): Range => {
  const startLine = hasNaNOrUndefined(node.line) ? 0 : node.line! - 1;
  const startChar = node.offset;
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

export const getRange = (token: IToken, startPosition?: Position): Range => {
  const start = Position.create(
    hasNaNOrUndefined(token.startLine) ? 0 : token.startLine! - 1,
    hasNaNOrUndefined(token.startOffset) ? 0 : token.startOffset
  );
  const line = hasNaNOrUndefined(token.endLine) ? 0 : token.endLine! - 1;

  const char = hasNaNOrUndefined(token.endOffset) ? 0 : token.endOffset! + 1;

  const end = Position.create(line, char);

  if (startPosition) {
    return Range.create(
      adjustPosition(start, startPosition),
      adjustPosition(end, startPosition)
    );
  }

  return Range.create(start, end);
};

export const locationToRange = (
  location?: CstNodeLocation,
  startPosition?: Position
): Range | undefined => {
  if (!location) {
    return;
  }
  const range = Range.create(
    hasNaNOrUndefined(location.startLine) ? 0 : location.startLine! - 1,
    hasNaNOrUndefined(location.startOffset) ? 0 : location.startOffset,
    hasNaNOrUndefined(location.endLine) ? 0 : location.endLine! - 1,
    hasNaNOrUndefined(location.endOffset) ? 0 : location.endOffset! + 1
  );
  if (startPosition) {
    return Range.create(
      adjustPosition(range.start, startPosition),
      adjustPosition(range.end, startPosition)
    );
  }
  return range;
};

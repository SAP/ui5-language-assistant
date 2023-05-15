import { IToken, CstNodeLocation } from "chevrotain";
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

export const getRange = (token: IToken, startPosition?: Position): Range => {
  const start = Position.create(
    hasNaNOrUndefined(token.startLine) ? 0 : token.startLine! - 1,
    hasNaNOrUndefined(token.startColumn) ? 0 : token.startColumn! - 1
  );
  const line = hasNaNOrUndefined(token.endLine) ? 0 : token.endLine! - 1;

  const char = hasNaNOrUndefined(token.endColumn) ? 0 : token.endColumn!;

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
    hasNaNOrUndefined(location.startColumn) ? 0 : location.startColumn! - 1,
    hasNaNOrUndefined(location.endLine) ? 0 : location.endLine! - 1,
    hasNaNOrUndefined(location.endColumn) ? 0 : location.endColumn!
  );
  if (startPosition) {
    return Range.create(
      adjustPosition(range.start, startPosition),
      adjustPosition(range.end, startPosition)
    );
  }
  return range;
};

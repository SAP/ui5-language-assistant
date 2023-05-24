import { IToken, CstNodeLocation, ILexingError } from "chevrotain";
import { VisitorParam } from "../types/property-binding-info";
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

export const getRange = (token: IToken, param?: VisitorParam): Range => {
  const startPosition = param?.position;

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
  param?: VisitorParam
): Range | undefined => {
  if (!location) {
    return;
  }
  const startPosition = param?.position;
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
  return range;
};

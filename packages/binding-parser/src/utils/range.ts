import { IToken, ILexingError } from "chevrotain";
import { VisitorParam } from "../types/binding-parser";
import { Position, Range } from "vscode-languageserver-types";

const hasNaNOrUndefined = (value: undefined | number): boolean => {
  if (value === undefined) {
    return true;
  }
  return isNaN(value);
};
const isNumber = (value: undefined | number): value is number => {
  const result = hasNaNOrUndefined(value);
  if (result) {
    return false;
  }
  return true;
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
  const startLine = isNumber(node.line) ? node.line - 1 : 0;
  const startChar = isNumber(node.column) ? node.column - 1 : 0;
  const start = Position.create(startLine, startChar);

  const endLine = isNumber(node.line) ? node.line - 1 : 0;
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
    isNumber(token.startLine) ? token.startLine - 1 : 0,
    isNumber(token.startColumn) ? token.startColumn - 1 : 0
  );
  const line = isNumber(token.endLine) ? token.endLine - 1 : 0;

  const char = isNumber(token.endColumn) ? token.endColumn : 0;

  const end = Position.create(line, char);
  if (startPosition) {
    return Range.create(
      adjustPosition(start, startPosition),
      adjustPosition(end, startPosition)
    );
  }

  return Range.create(start, end);
};

export const locationToRange = (param?: VisitorParam): Range | undefined => {
  const location = param?.location;
  if (!location) {
    return;
  }
  const startPosition = param?.position;
  let range = Range.create(
    isNumber(location.startLine) ? location.startLine - 1 : 0,
    isNumber(location.startColumn) ? location.startColumn - 1 : 0,
    isNumber(location.endLine) ? location.endLine - 1 : 0,
    isNumber(location.endColumn) ? location.endColumn : 0
  );
  if (startPosition) {
    range = Range.create(
      adjustPosition(range.start, startPosition),
      adjustPosition(range.end, startPosition)
    );
  }
  return range;
};

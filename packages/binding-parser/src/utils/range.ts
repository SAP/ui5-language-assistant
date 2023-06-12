import { IToken, ILexingError, CstNodeLocation } from "chevrotain";
import { VisitorParam } from "../types/binding-parser";
import { Position, Range } from "vscode-languageserver-types";

const isNaNOrUndefined = (value: undefined | number): boolean => {
  if (value === undefined) {
    return true;
  }
  return isNaN(value);
};
const isNumber = (value: undefined | number): value is number => {
  const result = isNaNOrUndefined(value);
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

const createRange = (item: CstNodeLocation | IToken) =>
  Range.create(
    isNumber(item.startLine) ? item.startLine - 1 : 0,
    isNumber(item.startColumn) ? item.startColumn - 1 : 0,
    isNumber(item.endLine) ? item.endLine - 1 : 0,
    isNumber(item.endColumn) ? item.endColumn : 0
  );

export const getRange = (token: IToken, param?: VisitorParam): Range => {
  const startPosition = param?.position;
  const { start, end } = createRange(token);
  if (startPosition) {
    return Range.create(
      adjustPosition(start, startPosition),
      adjustPosition(end, startPosition)
    );
  }

  return { start, end };
};

export const locationToRange = (param?: VisitorParam): Range | undefined => {
  const location = param?.location;
  if (!location) {
    return;
  }
  const startPosition = param?.position;
  const { start, end } = createRange(location);
  if (startPosition) {
    return Range.create(
      adjustPosition(start, startPosition),
      adjustPosition(end, startPosition)
    );
  }
  return { start, end };
};

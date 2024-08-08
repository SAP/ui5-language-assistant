import { CstNodeLocation } from "chevrotain";
import { Range } from "vscode-languageserver-types";

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

const createRange = (item: CstNodeLocation) =>
  Range.create(
    isNumber(item.startLine) ? item.startLine - 1 : 0,
    isNumber(item.startColumn) ? item.startColumn - 1 : 0,
    isNumber(item.endLine) ? item.endLine - 1 : 0,
    isNumber(item.endColumn) ? item.endColumn : 0
  );

export const locationToRange = (location?: CstNodeLocation): Range => {
  if (!location) {
    return Range.create({ line: 0, character: 0 }, { line: 0, character: 0 });
  }
  const { start, end } = createRange(location);
  return { start, end };
};

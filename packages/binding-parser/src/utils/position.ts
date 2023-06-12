import { Range, Position } from "vscode-languageserver-types";
/**
 * Check if the second range `e.g b` is within the first range `e.g a`
 */
export function rangeContained(
  a: Range,
  b: Range,
  includeEqual = false
): boolean {
  return (
    isBefore(a.start, b.start, includeEqual) &&
    isBefore(b.end, a.end, includeEqual)
  );
}
/**
 * checks if position is contained in range
 */
export function positionContained(
  range: Range | undefined,
  position: Position
): range is Range {
  return (
    range !== undefined &&
    !isBefore(position, range.start, false) &&
    isBefore(position, range.end, true)
  );
}

/**
 * Checks if position1 is before position2
 */
export function isBefore(
  pos1: Position,
  pos2: Position,
  includeEqual = false
): boolean {
  if (pos1.line < pos2.line) {
    return true;
  }
  if (pos1.line > pos2.line) {
    return false;
  }
  if (includeEqual) {
    return pos1.character <= pos2.character;
  }

  return pos1.character < pos2.character;
}

/**
 * Checks if range1 is positioned before adjacent range2
 */
export const isBeforeAdjacentRange = (
  range1?: Range,
  range2?: Range
): boolean => {
  if (!range1 || !range2) {
    return false;
  }
  if (
    range1.end.line === range2.start.line &&
    range1.end.character === range2.start.character
  ) {
    return true;
  }
  return false;
};
/**
 * Checks if range1 is positioned after adjacent range2
 */
export const isAfterAdjacentRange = (
  range1?: Range,
  range2?: Range
): boolean => {
  if (!range1 || !range2) {
    return false;
  }
  if (
    range1.start.line === range2.end.line &&
    range1.start.character === range2.end.character
  ) {
    return true;
  }
  return false;
};

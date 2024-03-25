import { SourcePosition, XMLAttribute, XMLElement } from "@xml-tools/ast";
import { Position } from "vscode-languageserver-textdocument";
export { buildFileUri, pathExists } from "./file";

const allowedAttrs = new Set([
  "controllerName",
  "template:require",
  "core:require",
]);
/**
 * Check if cursor position is contained in source position.
 *
 * @param sourcePos source position
 * @param cursorPosition cursor position
 * @returns boolean
 */
export function positionContained(
  sourcePos: SourcePosition,
  cursorPosition: Position
): boolean {
  if (sourcePos.startLine !== cursorPosition.line + 1) {
    return false;
  }
  if (
    sourcePos.startColumn <= cursorPosition.character &&
    sourcePos.endColumn >= cursorPosition.character
  ) {
    return true;
  }
  return false;
}

/**
 * Get attribute from xml element.
 * Following xml attribute are checked.
 * - "controllerName"
 * - "template:require"
 * - "core:require"
 *
 * @param element xml element
 * @param position cursor position
 * @returns xml attribute or undefined
 */
export function getAttribute(
  element: XMLElement,
  position: Position
): XMLAttribute | undefined {
  for (const attr of element.attributes) {
    if (allowedAttrs.has(attr.key ?? "")) {
      const attrPositionContain = positionContained(attr.position, position);
      if (attrPositionContain && attr.syntax.value) {
        const valuePositionContain = positionContained(
          attr.syntax.value,
          position
        );
        if (valuePositionContain) {
          return attr;
        }
      }
    }
  }
  return;
}

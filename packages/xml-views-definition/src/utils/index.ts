import { SourcePosition, XMLAttribute, XMLElement } from "@xml-tools/ast";
import { Position } from "vscode-languageserver-textdocument";
export { buildFileUri, pathExists } from "./file";

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
 *
 * @param element xml element
 * @param position cursor position
 * @param allowedAttrs allowed xml attributes
 * @returns xml attribute or undefined
 */
export function getAttribute(
  element: XMLElement,
  position: Position,
  allowedAttrs: Set<string>
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
  const subElements = element.subElements || [];
  for (const subElement of subElements) {
    const result = getAttribute(subElement, position, allowedAttrs);
    if (result) {
      return result;
    }
  }
}

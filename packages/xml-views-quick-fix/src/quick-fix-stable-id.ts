import { find, some, compact, map } from "lodash";
import { astPositionAtOffset } from "@xml-tools/ast-position";
import {
  XMLDocument,
  accept,
  XMLAstVisitor,
  XMLAttribute,
  XMLElement,
} from "@xml-tools/ast";
import { OffsetRange } from "@ui5-language-assistant/logic-utils";

const ID_PATTERN = /^_IDGen(.+)([1-9]\d*)$/;
const ID_PREFIX_PATTERN = "_IDGen";

export type QuickFixStableIdInfo = {
  newText: string;
  replaceRange: OffsetRange;
};

export function computeQuickFixStableIdInfo(
  xmlDoc: XMLDocument,
  errorOffset: OffsetRange[]
): QuickFixStableIdInfo[] {
  const biggestIdsByElementNameCollector = new BiggestIdsByElementNameCollector();
  accept(xmlDoc, biggestIdsByElementNameCollector);
  const biggestIdsByElementName =
    biggestIdsByElementNameCollector.biggestIdsByElementName;
  const quickFixStableIdInfo = compact(
    map(errorOffset, (_) => {
      const astNode = astPositionAtOffset(xmlDoc, _.start);
      if (astNode?.kind !== "XMLElementOpenName") {
        return undefined;
      }

      const xmlElement = astNode.astNode;
      /* istanbul ignore if - ast node of kind "XMLElementOpenName" will always have name  */
      if (
        xmlElement.name === null ||
        xmlElement.syntax.openName === undefined
      ) {
        return undefined;
      }

      const hasIdAttribute = some(
        xmlElement.attributes,
        (attrib) => attrib.key === "id"
      );

      const newText = computeQuickFixIdSuggestion(
        biggestIdsByElementName,
        xmlElement.name,
        hasIdAttribute
      );

      // @ts-expect-error - TSC does not understand: `xmlElement.syntax.openName !== undefined` is a type guard
      const replaceRange = computeQuickFixIdReplaceRange(xmlElement);
      return { newText, replaceRange };
    })
  );

  return quickFixStableIdInfo;
}

// We collect the biggest id number for each element name.
// The element name should match the pattern: `_IDGen{ElementName}{idNumber}`.
class BiggestIdsByElementNameCollector implements XMLAstVisitor {
  public biggestIdsByElementName: Record<string, number> = Object.create(null);
  visitXMLAttribute(xmlAttribute: XMLAttribute) {
    if (xmlAttribute.key === "id" && xmlAttribute.value !== null) {
      const match = ID_PATTERN.exec(xmlAttribute.value);
      if (match === null) {
        return;
      }

      const className = match[1];
      const suffix = parseInt(match[2]);
      if (
        this.biggestIdsByElementName[className] === undefined ||
        suffix > this.biggestIdsByElementName[className]
      ) {
        this.biggestIdsByElementName[className] = suffix;
      }
    }
  }
}

function computeQuickFixIdSuggestion(
  biggestIdsByElementName: Record<string, number>,
  elementName: string,
  hasIdAttribute: boolean
): string {
  const suffix = biggestIdsByElementName[elementName]
    ? biggestIdsByElementName[elementName] + 1
    : 1;
  biggestIdsByElementName[elementName] = suffix;
  let newText = `id="${ID_PREFIX_PATTERN}${elementName}${suffix}"`;
  if (!hasIdAttribute) {
    // We want extra space if there is no id key to seperate the new text from the tag name
    newText = " " + newText;
  }

  return newText;
}

function computeQuickFixIdReplaceRange(
  xmlElement: XMLElement & { syntax: { openName: { endOffset: number } } }
): OffsetRange {
  const idAttrib = find(xmlElement.attributes, (attrib) => attrib.key === "id");
  // Replace whole ID attribute area.
  if (idAttrib?.syntax.key !== undefined) {
    return {
      start: idAttrib.position.startOffset,
      end: idAttrib.position.endOffset,
    };
  } else {
    // There is no ID attribute - insert immediately after open tag.
    return {
      start: xmlElement.syntax.openName.endOffset + 1,
      end: xmlElement.syntax.openName.endOffset,
    };
  }
}

import { find, some } from "lodash";
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
  suggestion: string;
  offsetRange: OffsetRange;
};

export function computeQuickFixStableIdInfo(
  xmlDoc: XMLDocument,
  errorOffset: OffsetRange
): QuickFixStableIdInfo | undefined {
  const biggestIdsCollector = new IdsByElementNameCollectorVisitor();
  accept(xmlDoc, biggestIdsCollector);
  const biggestIdsOfElements = biggestIdsCollector.biggestIdsOfElements;
  const astNode = astPositionAtOffset(xmlDoc, errorOffset.start);
  if (astNode === undefined || astNode.kind !== "XMLElementOpenName") {
    return undefined;
  }

  const xmlElement = astNode.astNode;
  /* istanbul ignore if - ast node of kind "XMLElementOpenName" will always have name  */
  if (xmlElement.name === null || xmlElement.syntax.openName === undefined) {
    return undefined;
  }

  const isExistIdKey = some(
    xmlElement.attributes,
    (attrib) => attrib.key === "id"
  );

  const suggestion = getQuickFixIdSuggestion(
    biggestIdsOfElements,
    xmlElement.name,
    isExistIdKey
  );

  const offsetRange = getQuickFixIdRange(xmlElement);
  return { suggestion, offsetRange };
}

class IdsByElementNameCollectorVisitor implements XMLAstVisitor {
  public biggestIdsOfElements: Record<string, number> = Object.create(null);

  visitXMLAttribute(xmlAttribute: XMLAttribute) {
    if (xmlAttribute.key === "id" && xmlAttribute.value !== null) {
      const match = ID_PATTERN.exec(xmlAttribute.value);
      if (match === null) {
        return;
      }

      const className = match[1];
      const suffix = parseInt(match[2]);
      if (
        this.biggestIdsOfElements[className] === undefined ||
        suffix > this.biggestIdsOfElements[className]
      ) {
        this.biggestIdsOfElements[className] = suffix;
      }
    }
  }
}

function getQuickFixIdSuggestion(
  biggestIdsOfElements: Record<string, number>,
  elementName: string,
  isExistIdKey: boolean
): string {
  const suffix = biggestIdsOfElements[elementName]
    ? biggestIdsOfElements[elementName] + 1
    : 1;
  let suggestion = `id="${ID_PREFIX_PATTERN}${elementName}${suffix}"`;
  if (!isExistIdKey) {
    // We want extra space if there is no id key
    suggestion = " " + suggestion;
  }

  return suggestion;
}

function getQuickFixIdRange(xmlElement: XMLElement): OffsetRange {
  const idAttrib = find(xmlElement.attributes, (attrib) => attrib.key === "id");
  if (idAttrib !== undefined && idAttrib.syntax.key !== undefined) {
    return {
      start: idAttrib.position.startOffset,
      end: idAttrib.position.endOffset,
    };
  } else {
    return {
      //@ts-expect-error - we already checked the element has open name
      start: xmlElement.syntax.openName.endOffset + 1,
      //@ts-expect-error - we already checked the element has open name
      end: xmlElement.syntax.openName.endOffset,
    };
  }
}

import { find, some } from "lodash";
import { astPositionAtOffset } from "@xml-tools/ast-position";
import {
  XMLDocument,
  accept,
  XMLAstVisitor,
  XMLAttribute,
  XMLElement,
} from "@xml-tools/ast";
import { OffsetRange } from "@ui5-language-assistant/xml-views-validation";

const ID_PATTERN = /^_IDGen(.+)([1-9]\d*)$/;
const ID_PREFIX_PATTERN = "_IDGen";

type quickFixIdInfo = {
  quickFixIdSuggesion: string;
  quickFixIdOffsetRange: OffsetRange;
};

export function getQuickFixIdInfo(
  xmlDoc: XMLDocument,
  errorOffset: OffsetRange
): quickFixIdInfo | undefined {
  const biggestIdsCollector = new IdsByElementNameCollectorVisitor();
  accept(xmlDoc, biggestIdsCollector);
  const biggestIdsOfElements = biggestIdsCollector.biggestIdsOfElements;
  const astNode = astPositionAtOffset(xmlDoc, errorOffset.start);
  if (astNode === undefined || astNode.kind !== "XMLElementOpenName") {
    return undefined;
  }

  const xmlElement = astNode.astNode;
  if (xmlElement.name === null) {
    return undefined;
  }

  const isExistIdKey = some(
    xmlElement.attributes,
    (attrib) => attrib.key === "id"
  );

  const quickFixIdSuggesion = getQuickFixIdSuggestion(
    biggestIdsOfElements,
    xmlElement.name,
    isExistIdKey
  );

  const quickFixIdRange = getQuickFixIdRange(xmlElement);
  if (quickFixIdRange === undefined) {
    return undefined;
  }

  return { quickFixIdSuggesion, quickFixIdOffsetRange: quickFixIdRange };
}

class IdsByElementNameCollectorVisitor implements XMLAstVisitor {
  public biggestIdsOfElements: Record<string, number> = Object.create(null);

  visitXMLAttribute(xmlAttribute: XMLAttribute) {
    if (
      xmlAttribute.key === "id" &&
      xmlAttribute.value !== null &&
      ID_PATTERN.test(xmlAttribute.value)
    ) {
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
  let quickFixSuggestion = `id="${ID_PREFIX_PATTERN}${elementName}${suffix}"`;
  if (!isExistIdKey) {
    // We want extra space if there is no id key
    quickFixSuggestion = " " + quickFixSuggestion;
  }

  return quickFixSuggestion;
}

function getQuickFixIdRange(xmlElement: XMLElement): OffsetRange | undefined {
  const idAttrib = find(xmlElement.attributes, (attrib) => attrib.key === "id");
  if (idAttrib !== undefined && idAttrib.syntax.key !== undefined) {
    return {
      start: idAttrib.position.startOffset,
      end: idAttrib.position.endOffset,
    };
  } else if (xmlElement.syntax.openName !== undefined) {
    return {
      start: xmlElement.syntax.openName.endOffset + 1,
      end: xmlElement.syntax.openName.endOffset,
    };
  }

  return undefined;
}

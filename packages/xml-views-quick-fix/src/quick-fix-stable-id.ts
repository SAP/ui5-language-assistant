import { find, some, compact, map } from "lodash";
import { astPositionAtOffset } from "@xml-tools/ast-position";
import {
  accept,
  XMLAstVisitor,
  XMLAttribute,
  XMLElement,
} from "@xml-tools/ast";
import { OffsetRange } from "@ui5-language-assistant/logic-utils";
import type { Context } from "@ui5-language-assistant/context";

// https://sapui5.hana.ondemand.com/sdk/#/api/sap.ui.core.ID
const ID_PATTERN = /^[A-Za-z_][A-Za-z0-9_\-:.]*$/;
const ID_PREFIX_PATTERN = "_IDGen";

export type QuickFixStableIdInfo = {
  newText: string;
  replaceRange: OffsetRange;
};

export function computeQuickFixStableIdInfo(
  context: Context,
  errorOffset: OffsetRange[]
): QuickFixStableIdInfo[] {
  const biggestIdsByElementNameCollector =
    new BiggestIdsByElementNameCollector();
  const files = Object.keys(context.viewFiles);
  for (const docPath of files) {
    accept(context.viewFiles[docPath], biggestIdsByElementNameCollector);
  }
  const xmlDoc = context.viewFiles[context.documentPath];
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

      const className = match[0];
      if (this.biggestIdsByElementName[className] === undefined) {
        this.biggestIdsByElementName[className] = 1;
      } else {
        this.biggestIdsByElementName[className] += 1;
      }
    }
  }
}

/**
 * Get unique ID. It creates unique incremented number suffix for each new unique id.
 *
 * @param existingIds all existing ids in all `.xml` files
 * @param newId new suggested id
 * @param suffix index suffix
 * @returns unique id across `.xml` files
 */
function getUniqueId(
  existingIds: Record<string, number>,
  newId: string,
  suffix = 0
): string {
  if (existingIds[newId]) {
    const lastChar = Number(newId.slice(-1));
    if (!isNaN(lastChar)) {
      // last char is number
      suffix = lastChar + 1;
      // remove last char
      newId = newId.slice(0, -1);
    } else {
      suffix = suffix + 1;
    }
    return getUniqueId(existingIds, `${newId}${suffix}`);
  }
  return newId;
}

function computeQuickFixIdSuggestion(
  biggestIdsByElementName: Record<string, number>,
  elementName: string,
  hasIdAttribute: boolean
): string {
  const uniqueId = getUniqueId(
    biggestIdsByElementName,
    `${ID_PREFIX_PATTERN}${elementName}`
  );
  // keep track of newly generated id
  biggestIdsByElementName[uniqueId] = 1;

  let newText = `id="${uniqueId}"`;
  if (!hasIdAttribute) {
    // We want extra space if there is no id key to separate the new text from the tag name
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

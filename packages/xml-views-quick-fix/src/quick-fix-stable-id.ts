import { find, some, compact, map } from "lodash";
import { astPositionAtOffset } from "@xml-tools/ast-position";
import { XMLElement } from "@xml-tools/ast";
import { OffsetRange } from "@ui5-language-assistant/logic-utils";
import type { Context } from "@ui5-language-assistant/context";

const ID_PREFIX_PATTERN = "_IDGen";

export type QuickFixStableIdInfo = {
  newText: string;
  replaceRange: OffsetRange;
};

export function computeQuickFixStableIdInfo(
  context: Context,
  errorOffset: OffsetRange[],
  existingIds: Record<string, number>
): QuickFixStableIdInfo[] {
  const xmlDoc = context.viewFiles[context.documentPath];
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
        existingIds,
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
    const match = newId.match(/(\d+)$/);
    if (match) {
      let num = Number(match[0]);
      const len = match[0].length;
      // remove number char(s) from end
      newId = newId.slice(0, -len);
      suffix = ++num;
    } else {
      suffix = suffix + 1;
    }
    return getUniqueId(existingIds, `${newId}${suffix}`);
  }
  return newId;
}

function computeQuickFixIdSuggestion(
  existingIds: Record<string, number>,
  elementName: string,
  hasIdAttribute: boolean
): string {
  const uniqueId = getUniqueId(
    existingIds,
    `${ID_PREFIX_PATTERN}${elementName}`
  );
  // keep track of newly generated id
  existingIds[uniqueId] = 1;

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

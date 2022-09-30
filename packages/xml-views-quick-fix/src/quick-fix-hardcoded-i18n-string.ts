import { compact, map } from "lodash";
import { astPositionAtOffset } from "@xml-tools/ast-position";
import { XMLDocument } from "@xml-tools/ast";
import { OffsetRange } from "@ui5-language-assistant/logic-utils";
import { Property } from "properties-file";

const NEW_LINE_PATTERN = /[\n\t]/g;
const DOUBLE_SPACE_PATTERN = /\s+(?=\s)/g;

export type QuickFixHardcodedI18nStringInfo = {
  newTextSuggestions: QuickFixHardcodedI18nSuggestion[];
  replaceRange: OffsetRange;
};

export type QuickFixHardcodedI18nSuggestion = {
  suggestionKey: string;
  suggestionValue: string;
  newText: string;
};

export function computeQuickFixHardcodedI18nStringInfo(
  xmlDoc: XMLDocument,
  errorOffset: OffsetRange[],
  resourceBundle: Property[]
): QuickFixHardcodedI18nStringInfo[] {
  const quickFixHardcodedI18nStringInfo = compact(
    map(errorOffset, (_) => {
      const astNode = astPositionAtOffset(xmlDoc, _.start);
      if (astNode?.kind !== "XMLAttributeValue") {
        return undefined;
      }

      const xmlAttribute = astNode.astNode;
      let key = "";
      if (
        xmlAttribute.key === null ||
        xmlAttribute.value === null ||
        xmlAttribute.value === ""
      ) {
        return undefined;
      } else {
        key = xmlAttribute.key;
      }

      if (resourceBundle.length === 0) {
        return undefined;
      }

      const newTextSuggestions: QuickFixHardcodedI18nSuggestion[] = [];

      // Text value for xmlAttribute.value without spaces, tabs, new lines
      const escapedXmlAttributeValue = xmlAttribute.value
        .trim()
        .replace(NEW_LINE_PATTERN, "")
        .replace(DOUBLE_SPACE_PATTERN, "");
      // Possible i18n key replacements to suggest (only 100% matches are returned)
      const i18nReplacementSuggestions = resourceBundle.filter((property) => {
        return property.escapedValue === escapedXmlAttributeValue;
      });

      // If i18n key replacements are found, suggest them as possible fixes
      i18nReplacementSuggestions.forEach((property) => {
        const newTextSuggestion = computeQuickFixI18nSuggestion(
          key,
          property.escapedValue,
          property.escapedKey
        );
        newTextSuggestions.push(newTextSuggestion);
      });

      const replaceRange = {
        start: xmlAttribute.position.startOffset,
        end: xmlAttribute.position.endOffset,
      };

      return { newTextSuggestions, replaceRange };
    })
  );

  return quickFixHardcodedI18nStringInfo;
}

function computeQuickFixI18nSuggestion(
  attributeKey: string,
  i18nReplacementSuggestionValue: string,
  i18nReplacementSuggestionKey: string
): QuickFixHardcodedI18nSuggestion {
  const newTextSuggestion = {
    suggestionKey: i18nReplacementSuggestionKey,
    suggestionValue: i18nReplacementSuggestionValue,
    newText: `${attributeKey}="{i18n>${i18nReplacementSuggestionKey}}"`,
  };
  return newTextSuggestion;
}

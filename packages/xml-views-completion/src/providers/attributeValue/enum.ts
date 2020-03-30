import { map, find } from "lodash";
import { XMLAttribute } from "@xml-tools/ast";
import { flattenProperties } from "@ui5-language-assistant/logic-utils";
import { UI5EnumsInXMLAttributeValueCompletion } from "../../../api";
import {
  getClassByElement,
  filterMembersForSuggestion
} from "../utils/filter-members";
import { UI5AttributeValueCompletionOptions } from "./index";
import { UI5EnumValue } from "@ui5-editor-tools/semantic-model-types";

/**
 * Suggests Enum value inside Attribute
 * For example: 'ListSeparators' in 'showSeparators' attribute in `sap.m.ListBase` element
 */
export function enumSuggestions(
  opts: UI5AttributeValueCompletionOptions
): UI5EnumsInXMLAttributeValueCompletion[] {
  const xmlElement = opts.element;
  const xmlAttribute = opts.attribute;

  const elementClass = getClassByElement(xmlElement, opts.context);
  if (elementClass === undefined) {
    return [];
  }
  const properties = flattenProperties(elementClass);
  const ui5Property = find(properties, ["name", xmlAttribute.key]);
  const propType = ui5Property?.type;
  if (propType?.kind !== "UI5Enum") {
    return [];
  }

  const fields = propType.fields;
  const prefix = opts.prefix ?? "";
  const prefixMatchingEnumValues: UI5EnumValue[] = filterMembersForSuggestion(
    fields,
    prefix,
    []
  );

  return map(prefixMatchingEnumValues, _ => ({
    type: "UI5EnumsInXMLAttributeValue",
    ui5Node: _,
    astNode: opts.attribute as XMLAttribute
  }));
}

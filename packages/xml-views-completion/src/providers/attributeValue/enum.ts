import { map, find } from "lodash";
import { XMLAttribute } from "@xml-tools/ast";
import { flattenProperties } from "@ui5-editor-tools/logic-utils";
import { XMLViewCompletion } from "../../../api";
import {
  getClassByElement,
  filterMembersForSuggestion
} from "../utils/filter-members";
import { UI5AttributeValueCompletionOptions } from "./index";

/**
 * Suggests Enum value inside Attribute
 * For example: 'ListSeparators' in 'showSeparators' attribute in `sap.m.ListBase` element
 */
export function enumSuggestions(
  opts: UI5AttributeValueCompletionOptions
): XMLViewCompletion[] {
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
  const prefixMatchingEnumValues = filterMembersForSuggestion(
    fields,
    prefix,
    []
  );

  const suggestions = map(prefixMatchingEnumValues, _ => ({
    ui5Node: _,
    astNode: opts.attribute as XMLAttribute
  }));
  return suggestions;
}

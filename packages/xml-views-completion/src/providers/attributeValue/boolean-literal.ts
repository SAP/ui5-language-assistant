import { map, find } from "lodash";
import { XMLAttribute } from "@xml-tools/ast";
import { flattenProperties } from "@ui5-language-assistant/logic-utils";
import {
  BooleanValueInXMLAttributeValueCompletion,
  BooleanValue,
} from "../../../api";
import {
  getClassByElement,
  filterMembersForSuggestion,
} from "../utils/filter-members";
import { UI5AttributeValueCompletionOptions } from "./index";

/**
 * Suggests boolean value (true/false) inside attribute value
 */
export function booleanSuggestions(
  opts: UI5AttributeValueCompletionOptions
): BooleanValueInXMLAttributeValueCompletion[] {
  const xmlElement = opts.element;
  const xmlAttribute = opts.attribute;

  const elementClass = getClassByElement(xmlElement, opts.context);
  if (elementClass === undefined) {
    return [];
  }
  const properties = flattenProperties(elementClass);
  const ui5Property = find(properties, ["name", xmlAttribute.key]);
  const propType = ui5Property?.type;
  if (propType?.kind !== "PrimitiveType" || propType.name !== "Boolean") {
    return [];
  }

  const values: BooleanValue[] = [
    {
      kind: "BooleanValue",
      name: "true",
      value: true,
    },
    {
      kind: "BooleanValue",
      name: "false",
      value: false,
    },
  ];
  const prefix = opts.prefix ?? "";
  const prefixMatchingValues = filterMembersForSuggestion(values, prefix, []);

  return map(prefixMatchingValues, (_) => ({
    type: "BooleanValueInXMLAttributeValue",
    astNode: opts.attribute as XMLAttribute,
    ui5Node: _,
  }));
}

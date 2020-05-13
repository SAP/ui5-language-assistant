import { map } from "lodash";
import { XMLAttribute } from "@xml-tools/ast";
import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";
import {
  BooleanValueInXMLAttributeValueCompletion,
  BooleanValue,
} from "../../../api";
import { filterMembersForSuggestion } from "../utils/filter-members";
import { UI5AttributeValueCompletionOptions } from "./index";

const allBooleanValues: BooleanValue[] = [
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

/**
 * Suggests boolean value (true/false) inside attribute value
 */
export function booleanSuggestions(
  opts: UI5AttributeValueCompletionOptions
): BooleanValueInXMLAttributeValueCompletion[] {
  const ui5Property = getUI5PropertyByXMLAttributeKey(
    opts.attribute,
    opts.context
  );
  const propType = ui5Property?.type;
  if (propType?.kind !== "PrimitiveType" || propType.name !== "Boolean") {
    return [];
  }

  const prefix = opts.prefix ?? "";
  const prefixMatchingValues = filterMembersForSuggestion(
    allBooleanValues,
    prefix,
    []
  );

  const completions: BooleanValueInXMLAttributeValueCompletion[] = map(
    prefixMatchingValues,
    (_) => ({
      type: "BooleanValueInXMLAttributeValue",
      astNode: opts.attribute as XMLAttribute,
      ui5Node: _,
    })
  );
  return completions;
}

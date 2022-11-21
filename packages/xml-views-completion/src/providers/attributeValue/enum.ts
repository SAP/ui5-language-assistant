import { map } from "lodash";
import { XMLAttribute } from "@xml-tools/ast";
import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";
import { UI5EnumsInXMLAttributeValueCompletion } from "../../../api";
import { filterMembersForSuggestion } from "../utils/filter-members";
import { UI5AttributeValueCompletionOptions } from "./index";
import { UI5EnumValue } from "@ui5-language-assistant/semantic-model-types";

/**
 * Suggests Enum value inside Attribute
 * For example: 'ListSeparators' in 'showSeparators' attribute in `sap.m.ListBase` element
 */
export function enumSuggestions(
  opts: UI5AttributeValueCompletionOptions
): UI5EnumsInXMLAttributeValueCompletion[] {
  const ui5Property = getUI5PropertyByXMLAttributeKey(
    opts.attribute,
    opts.context.ui5Model
  );
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

  return map(prefixMatchingEnumValues, (_) => ({
    type: "UI5EnumsInXMLAttributeValue",
    ui5Node: _,
    astNode: opts.attribute as XMLAttribute,
  }));
}

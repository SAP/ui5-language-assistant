import { map } from "lodash";
import { XMLAttribute } from "@xml-tools/ast";
import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";
import { UI5EnumsInXMLAttributeValueCompletion } from "../../../api";
import { filterMembersForSuggestion } from "../utils/filter-members";
import { UI5AttributeValueCompletionOptions } from "./index";
import {
  UI5Field,
  UI5IconValue,
} from "@ui5-language-assistant/semantic-model-types";

/**
 * Suggests Enum value inside Attribute
 * For example: 'ListSeparators' in 'showSeparators' attribute in `sap.m.ListBase` element
 */
export function iconSuggestions(
  opts: UI5AttributeValueCompletionOptions
): void | UI5EnumsInXMLAttributeValueCompletion[] {
  const ui5Property = getUI5PropertyByXMLAttributeKey(
    opts.attribute,
    opts.context
  );
  const propType = ui5Property?.type;
  if (propType?.kind !== "UI5Namespace") {
    return [];
  }

  const fields = propType.fields;
  const prefix = opts.prefix ?? "";
  const prefixMatchingIconValues: UI5Field[] = filterMembersForSuggestion(
    fields,
    prefix,
    []
  );

  // return map(prefixMatchingIconValues, (_) => ({
  //   type: "UI5EnumsInXMLAttributeValue",
  //   ui5Node: _,
  //   astNode: opts.attribute as XMLAttribute,
  // }));
}

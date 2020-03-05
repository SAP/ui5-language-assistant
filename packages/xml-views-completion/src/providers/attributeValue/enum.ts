import { map, find } from "lodash";
import { XMLAttribute } from "@xml-tools/ast";
import { flattenProperties } from "@vscode-ui5/logic-utils";
import { UI5Prop, UI5Enum } from "@vscode-ui5/semantic-model-types";
import { XMLViewCompletion } from "../../../api";
import { UI5AttributeValueCompletionOptions } from "./index";
import {
  getClassByElement,
  filterMembersForSuggestion
} from "../utils/filter-members";

/**
 * Suggests Enum value inside Attribute
 * For example: 'ListSeparators' in 'showSeparators' attribute in `sap.m.ListBase` element
 */
export function enumSuggestions(
  opts: UI5AttributeValueCompletionOptions
): XMLViewCompletion[] {
  const astNode = opts.attribute as XMLAttribute;
  const elementClass = getClassByElement(opts.element, opts.context);
  const properties = flattenProperties(elementClass);
  const property = find(properties, ["name", astNode.key]) as UI5Prop;

  if (!areEnumSuggestionsApplicable({ property })) {
    return [];
  }

  const ui5Enum = property.type as UI5Enum;
  const fields = ui5Enum.fields;

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

function areEnumSuggestionsApplicable(opts: { property: UI5Prop }): boolean {
  if (opts.property.type?.kind !== "UI5Enum") {
    return false;
  }
  return true;
}

import { map, find } from "lodash";
import { XMLAttribute } from "@xml-tools/ast";
import { flattenProperties } from "@vscode-ui5/logic-utils";
import { UI5Enum, UI5Type } from "@vscode-ui5/semantic-model-types";
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
  const astNode = opts.attribute as XMLAttribute;
  const elementClass = getClassByElement(opts.element, opts.context);
  const properties = flattenProperties(elementClass);
  const ui5Property = find(properties, ["name", astNode.key]);
  const propType = ui5Property?.type;

  if (!areEnumSuggestionsApplicable(propType)) {
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

function areEnumSuggestionsApplicable(
  type: UI5Type | undefined
): type is UI5Enum {
  return type?.kind === "UI5Enum";
}

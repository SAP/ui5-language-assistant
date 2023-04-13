import { XMLAttribute, XMLElement } from "@xml-tools/ast";
import {
  UI5Event,
  UI5Prop,
  UI5Association,
} from "@ui5-language-assistant/semantic-model-types";
import {
  flattenEvents,
  flattenProperties,
  flattenAssociations,
  isElementSubClass,
  getUI5ClassByXMLElement,
} from "@ui5-language-assistant/logic-utils";
import { compact, map, uniq, reject } from "lodash";
import { UI5AttributeNameCompletionOptions } from "./index";
import {
  UI5AssociationsInXMLAttributeKeyCompletion,
  UI5EventsInXMLAttributeKeyCompletion,
  UI5PropsInXMLAttributeKeyCompletion,
} from "../../../api";
import { filterMembersForSuggestion } from "../utils/filter-members";

type PropEventsAssocInXMLAttributeKeyCompletion =
  | UI5PropsInXMLAttributeKeyCompletion
  | UI5EventsInXMLAttributeKeyCompletion
  | UI5AssociationsInXMLAttributeKeyCompletion;

const NodeKindToSuggestionType: Record<
  "UI5Prop" | "UI5Event" | "UI5Association",
  | "UI5PropsInXMLAttributeKey"
  | "UI5EventsInXMLAttributeKey"
  | "UI5AssociationsInXMLAttributeKey"
> = {
  UI5Prop: "UI5PropsInXMLAttributeKey",
  UI5Event: "UI5EventsInXMLAttributeKey",
  UI5Association: "UI5AssociationsInXMLAttributeKey",
};

/**
 * Suggests Properties and Events inside Element
 * For example: 'backgroundDesign' and 'icon' in `sap.m.Page` element
 */
export function propEventAssocSuggestions(
  opts: UI5AttributeNameCompletionOptions
): PropEventsAssocInXMLAttributeKeyCompletion[] {
  const ui5Model = opts.context.ui5Model;
  const xmlElement = opts.element;

  const elementClass = getUI5ClassByXMLElement(xmlElement, ui5Model);
  if (!isElementSubClass(elementClass)) {
    return [];
  }
  const allProps: (UI5Prop | UI5Event | UI5Association)[] =
    flattenProperties(elementClass);
  const allEvents = flattenEvents(elementClass);
  const allAssociations = flattenAssociations(elementClass);
  const allPropertiesEventsAssociations = allProps
    .concat(allEvents)
    .concat(allAssociations);

  const prefix = opts.prefix ?? "";
  const existingAttributeNames = compact(
    uniq(map(xmlElement.attributes, (_) => _.key))
  );
  const currentAttributeKey = opts.attribute?.key;
  const existingAttributeNamesWithoutCurrent =
    currentAttributeKey === undefined
      ? existingAttributeNames
      : reject(existingAttributeNames, (name) => name === currentAttributeKey);

  const uniquePrefixMatchingAttributes = filterMembersForSuggestion(
    allPropertiesEventsAssociations,
    prefix,
    existingAttributeNamesWithoutCurrent
  );

  const suggestions = map(uniquePrefixMatchingAttributes, (_) => ({
    type: NodeKindToSuggestionType[_.kind],
    ui5Node: _,
    astNode:
      (opts.attribute as XMLAttribute) ?? createDummyAttribute(xmlElement),
  }));

  // Using casing due to dynamic assignment to the `type` property of each suggestion
  return suggestions as PropEventsAssocInXMLAttributeKeyCompletion[];
}

/**
 * When no prefix exists there would be no corresponding XMLAttribute in the XML AST.
 * By creating a "dummy" attribute we remain consistent with the expected API of `XMLViewCompletion`.
 */
function createDummyAttribute(parent: XMLElement): XMLAttribute {
  return {
    type: "XMLAttribute",
    key: null,
    // Note the "dummy" XMLAttribute has a parent, however the parent does **not** reference the attribute.
    parent: parent,
    position: {
      startOffset: -1,
      endOffset: -1,
      startLine: -1,
      endLine: -1,
      startColumn: -1,
      endColumn: -1,
    },
    syntax: {},
    value: null,
  };
}

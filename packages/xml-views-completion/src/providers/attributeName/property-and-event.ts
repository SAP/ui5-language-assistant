import { XMLAttribute, XMLElement } from "@xml-tools/ast";
import {
  UI5Event,
  UI5Prop,
  UI5SemanticModel
} from "@vscode-ui5/semantic-model-types";
import {
  flattenEvents,
  flattenProperties,
  isControlSubClass
} from "@vscode-ui5/logic-utils";
import { compact, map, uniq } from "lodash";
import { UI5AttributeNameCompletionOptions } from "./index";
import { XMLViewCompletion } from "../../../api";
import {
  filterMembersForSuggestion,
  getClassByElement
} from "../utils/filter-members";

/**
 * Suggests Properties and Events inside Element
 * For example: 'backgroundDesign' and 'icon' in `sap.m.Page` element
 */
export function propertyAndEventSuggestions(
  opts: UI5AttributeNameCompletionOptions
): XMLViewCompletion[] {
  const astNode = opts.element;

  if (
    !arePropertyAndEventSuggestionsApplicable({
      astNode,
      model: opts.context
    })
  ) {
    return [];
  }

  const elementClass = getClassByElement(astNode, opts.context);
  const allProps: (UI5Prop | UI5Event)[] = flattenProperties(elementClass);
  const allEvents = flattenEvents(elementClass);
  const allPropertiesAndEvents = allProps.concat(allEvents);

  const prefix = opts.prefix ?? "";
  const existingPropertiesAndEventsNames = compact(
    uniq(map(astNode.attributes, _ => _.key))
  );

  const uniquePrefixMatchingAttributes = filterMembersForSuggestion(
    allPropertiesAndEvents,
    prefix,
    existingPropertiesAndEventsNames
  );

  return map(uniquePrefixMatchingAttributes, _ => ({
    ui5Node: _,
    astNode: (opts.attribute as XMLAttribute) ?? createDummyAttribute(astNode)
  }));
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
      endColumn: -1
    },
    syntax: {},
    value: null
  };
}

function arePropertyAndEventSuggestionsApplicable(opts: {
  astNode: XMLElement;
  model: UI5SemanticModel;
}): boolean {
  const elementClass = getClassByElement(opts.astNode, opts.model);
  return elementClass !== undefined && isControlSubClass(elementClass);
}

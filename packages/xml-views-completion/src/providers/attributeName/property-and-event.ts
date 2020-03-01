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
      model: opts.context,
      prefix: opts.prefix
    })
  ) {
    return [];
  }

  const elementClass = getClassByElement(astNode, opts.context);

  const allPropertiesAndEvents = (flattenProperties(elementClass) as (
    | UI5Prop
    | UI5Event
  )[]).concat(flattenEvents(elementClass));

  const prefix = opts.prefix ?? "";
  const existingPropertiesAndEvents = compact(
    uniq(map(astNode.attributes, _ => _.key))
  );

  const uniquePrefixMatchingAttributes = filterMembersForSuggestion(
    allPropertiesAndEvents,
    prefix,
    existingPropertiesAndEvents
  );

  return map(uniquePrefixMatchingAttributes, _ => ({
    ui5Node: _,
    astNode: (opts.attribute as XMLAttribute) ?? createDummyAttribute(astNode)
  }));
}

function createDummyAttribute(parent: XMLElement): XMLAttribute {
  return {
    type: "XMLAttribute",
    key: null,
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
  prefix: string | undefined;
  model: UI5SemanticModel;
}): boolean {
  const elementClass = getClassByElement(opts.astNode, opts.model);
  return elementClass != undefined && isControlSubClass(elementClass);
}

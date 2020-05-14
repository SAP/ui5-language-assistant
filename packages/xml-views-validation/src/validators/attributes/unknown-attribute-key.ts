import { includes, find } from "lodash";
import { XMLAttribute } from "@xml-tools/ast";
import {
  UI5SemanticModel,
  UI5Aggregation,
  UI5Association,
  UI5Event,
  UI5Prop,
} from "@ui5-language-assistant/semantic-model-types";
import {
  getUI5ClassByXMLElement,
  getUI5AggregationByXMLElement,
  isXMLNamespaceKey,
  flattenProperties,
  flattenEvents,
  flattenAssociations,
  flattenAggregations,
  ui5NodeToFQN,
} from "@ui5-language-assistant/logic-utils";
import { UnknownAttributeKeyIssue } from "../../../api";
import { TEMPLATING_NS, CUSTOM_DATA_NS } from "../../utils/special-namespaces";

export function validateUnknownAttributeKey(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): UnknownAttributeKeyIssue[] {
  if (attribute.syntax.key === undefined || attribute.key === null) {
    // Can't give an error without a position or value
    return [];
  }

  if (isAttributeNameAlwaysValid(attribute)) {
    return [];
  }

  // Only validate (known) classes and aggregations
  const xmlElement = attribute.parent;
  const ui5Class = getUI5ClassByXMLElement(xmlElement, model);
  let ui5Aggregation: UI5Aggregation | undefined = undefined;
  if (ui5Class === undefined) {
    ui5Aggregation = getUI5AggregationByXMLElement(xmlElement, model);
  }

  // Aggregations don't have additional allowed attributes
  if (ui5Aggregation !== undefined) {
    return [
      {
        kind: "UnknownAttributeKey",
        message: `Unknown attribute key: ${attribute.key}`,
        offsetRange: {
          start: attribute.syntax.key.startOffset,
          end: attribute.syntax.key.endOffset,
        },
        severity: "error",
      },
    ];
  }

  if (ui5Class === undefined) {
    return [];
  }

  // Special case: "class" property can be used on all Controls and selected Elements.
  // TODO Should this be in the model? Should it be suggested for code completion?
  if (attribute.key === "class") {
    return [];
  }

  // Special case: "binding" property is a synonym for "objectBindings" special setting on ManagedObject
  // TODO Should this be in the model? Should it be suggested for code completion?
  if (attribute.key === "binding") {
    return [];
  }

  // Special case: "stashed" property can appear under sap.uxap.ObjectPageLazyLoader
  // Technically it can be under any Element but it should only be used for this one.
  // TODO Should this be in the model? Should it be suggested for code completion?
  if (
    attribute.key === "stashed" &&
    ui5NodeToFQN(ui5Class) === "sap.uxap.ObjectPageLazyLoader"
  ) {
    return [];
  }

  const allProps: (
    | UI5Prop
    | UI5Event
    | UI5Association
    | UI5Aggregation
  )[] = flattenProperties(ui5Class);
  const allEvents = flattenEvents(ui5Class);
  const allAssociations = flattenAssociations(ui5Class);
  // Aggregations can be used as attributes for binding
  const allAggregations = flattenAggregations(ui5Class);
  const allClassUI5Attributes = allProps
    .concat(allEvents)
    .concat(allAssociations)
    .concat(allAggregations);
  // TODO Should we filter out non-public/protected names?
  if (
    find(allClassUI5Attributes, (_) => _.name === attribute.key) !== undefined
  ) {
    return [];
  }

  return [
    {
      kind: "UnknownAttributeKey",
      message: `Unknown attribute key: ${attribute.key}`,
      offsetRange: {
        start: attribute.syntax.key.startOffset,
        end: attribute.syntax.key.endOffset,
      },
      severity: "error",
    },
  ];
}

function isAttributeNameAlwaysValid(attribute: XMLAttribute): boolean {
  // This will never happen - it was checked before calling this function
  /* istanbul ignore if */
  if (attribute.key === null) {
    return true;
  }
  // xmlns attributes are always valid
  // TODO "xmlns:" should not return true (change when using new function in xml-utils)
  if (isXMLNamespaceKey(attribute.key)) {
    return true;
  }
  const { ns, name } = splitAttributeByNamespace(attribute);
  // sap.ui.dt:designtime is always valid
  if (ns === "sap.ui.dt" && name === "designtime") {
    return true;
  }
  // sap.ui.core:require is always valid
  // TODO this is not true for FragmentDefinition inside xml views
  // See: https://openui5nightly.hana.ondemand.com/topic/b11d853a8e784db6b2d210ef57b0f7d7
  if (ns === "sap.ui.core" && name === "require") {
    return true;
  }

  // templates require is always valid
  if (ns === TEMPLATING_NS && name === "require") {
    return true;
  }

  // All attributes in the custom data namespace are always valid
  if (ns === CUSTOM_DATA_NS) {
    return true;
  }

  return false;
}

function splitAttributeByNamespace(
  attribute: XMLAttribute
): { ns: string | undefined; name: string | undefined } {
  // This will never happen - it was checked before calling this function
  /* istanbul ignore if */
  if (attribute.key === null) {
    return { name: undefined, ns: undefined };
  }
  if (!includes(attribute.key, ":")) {
    return { name: attribute.key, ns: undefined };
  }
  const match = attribute.key.match(/(?<ns>[^:]*)(:(?<name>.*))?/);
  // There will always be a match because the attribute key always contains a colon at this point
  /* istanbul ignore next */
  const matchGroups = match?.groups ?? {};
  const ns = matchGroups.ns;
  // ns will never be undefined (it might be empty)
  /* istanbul ignore next */
  const resolvedNS =
    ns === undefined ? undefined : attribute.parent.namespaces[ns];
  return {
    ns: resolvedNS,
    name: matchGroups.name,
  };
}

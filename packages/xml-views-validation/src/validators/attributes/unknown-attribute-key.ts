import { includes, find, filter } from "lodash";
import { XMLAttribute } from "@xml-tools/ast";
import {
  UI5SemanticModel,
  UI5Class,
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

  // UI5 Class case
  const ui5Class = getUI5ClassByXMLElement(xmlElement, model);
  if (ui5Class !== undefined) {
    if (isValidUI5ClassAttribute(ui5Class, attribute)) {
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

  // UI5 Aggregation case
  const ui5Aggregation = getUI5AggregationByXMLElement(xmlElement, model);
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

  // No validations on unknown tags
  return [];
}

function isAttributeNameAlwaysValid(attribute: XMLAttribute): boolean {
  // This will never happen - it was checked before calling this function
  /* istanbul ignore if */
  if (attribute.key === null) {
    return true;
  }
  // xmlns attributes are always valid
  // TODO "xmlns:" should not return true (change when using new function in xml-tools)
  if (isXMLNamespaceKey(attribute.key)) {
    return true;
  }

  const { ns, name } = splitAttributeByNamespace(attribute);

  // The following attributes are valid on all tags
  // undefined name means all attribute names in the namespace are valid
  const ALWAYS_VALID_ATTRIBUTES = [
    // See: https://sapui5.hana.ondemand.com/#/topic/de9fd55c69af4b46863f5d26b5d796c4
    { ns: "sap.ui.dt", name: "designtime" },
    // See: https://sapui5.hana.ondemand.com/#/topic/b11d853a8e784db6b2d210ef57b0f7d7
    // TODO this attribute is not valid for FragmentDefinition inside xml views
    { ns: "sap.ui.core", name: "require" },
    // See: https://sapui5.hana.ondemand.com/#/topic/263f6e5a915f430894ee290040e7e220
    { ns: TEMPLATING_NS, name: "require" },
    // See: https://sapui5.hana.ondemand.com/#/topic/91f0c3ee6f4d1014b6dd926db0e91070
    { ns: CUSTOM_DATA_NS, name: undefined },
  ];

  if (
    find(
      ALWAYS_VALID_ATTRIBUTES,
      (_) => _.ns === ns && (_.name === undefined || _.name === name)
    ) !== undefined
  ) {
    return true;
  }

  return false;
}

function isValidUI5ClassAttribute(
  ui5Class: UI5Class,
  attribute: XMLAttribute
): boolean {
  // The following attributes are valid on all classes
  // undefined fqn means the attribute is valid on all classes
  // TODO Should these be in the model? Should they be suggested for code completion?
  const ALWAYS_VALID_CLASS_ATTRIBUTES = [
    // "class" attribute can be used on all Controls and selected Elements
    // See: https://sapui5.hana.ondemand.com/#/topic/b564935324f449209354c7e2f9903f22
    { name: "class", fqn: undefined },
    // "binding" is a synonym for "objectBindings" special setting on ManagedObject
    // See: https://sapui5.hana.ondemand.com/#/topic/91f05e8b6f4d1014b6dd926db0e91070
    { name: "binding", fqn: undefined },
    // Technically the "stashed" attribute can be under any Element but it should only be used
    // for sap.uxap.ObjectPageLazyLoader
    // See: https://sapui5.hana.ondemand.com/#/api/sap.uxap.ObjectPageLazyLoader
    { name: "stashed", fqn: "sap.uxap.ObjectPageLazyLoader" },
  ];

  if (
    find(
      ALWAYS_VALID_CLASS_ATTRIBUTES,
      (_) =>
        _.name === attribute.key &&
        (_.fqn === undefined || _.fqn === ui5NodeToFQN(ui5Class))
    ) !== undefined
  ) {
    return true;
  }

  const allProps: { name: string; visibility: string }[] = flattenProperties(
    ui5Class
  );
  const allEvents = flattenEvents(ui5Class);
  const allAssociations = flattenAssociations(ui5Class);
  // Aggregations can be used as attributes for binding
  // See: https://sapui5.hana.ondemand.com/#/topic/91f057786f4d1014b6dd926db0e91070
  // 0..1 aggregations with alType can also be specified as attributes
  // See: https://sapui5.hana.ondemand.com/#/topic/19eabf5b13214f27b929b9473df3195b
  const allAggregations = flattenAggregations(ui5Class);
  const allClassUI5Attributes = allProps
    .concat(allEvents)
    .concat(allAssociations)
    .concat(allAggregations);

  // Only allow public/protected attributes
  const allowedVisibility = ["public", "protected"];
  const publicClassUI5Attributes = filter(allClassUI5Attributes, (_) =>
    includes(allowedVisibility, _.visibility)
  );

  if (
    find(publicClassUI5Attributes, (_) => _.name === attribute.key) !==
    undefined
  ) {
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
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const matchGroups = match!.groups!;
  const resolvedNS = attribute.parent.namespaces[matchGroups.ns];
  return {
    ns: resolvedNS,
    name: matchGroups.name,
  };
}

import { includes, find, filter } from "lodash";
import { XMLAttribute } from "@xml-tools/ast";
import { isXMLNamespaceKey } from "@xml-tools/common";
import {
  UI5SemanticModel,
  UI5Class,
} from "@ui5-language-assistant/semantic-model-types";
import {
  getUI5ClassByXMLElement,
  getUI5AggregationByXMLElement,
  flattenProperties,
  flattenEvents,
  flattenAssociations,
  flattenAggregations,
  ui5NodeToFQN,
  splitQNameByNamespace,
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
  if (isXMLNamespaceKey({ key: attribute.key, includeEmptyPrefix: false })) {
    return true;
  }

  // Cast is necessary because typescript doesn't recognize the check above for attribute.key to be a type guard
  const { ns, name } = splitAttributeByNamespace(
    attribute as XMLAttribute & { key: string }
  );

  // The following attributes are valid on all tags
  const ALL_ATTRIBUTE_NAMES = undefined;
  const ALWAYS_VALID_ATTRIBUTES = [
    // See: https://sapui5.hana.ondemand.com/#/topic/de9fd55c69af4b46863f5d26b5d796c4
    { ns: "sap.ui.dt", name: "designtime" },
    // See: https://sapui5.hana.ondemand.com/#/topic/b11d853a8e784db6b2d210ef57b0f7d7
    // TODO this attribute is not valid for FragmentDefinition inside xml views
    { ns: "sap.ui.core", name: "require" },
    // See: https://sapui5.hana.ondemand.com/#/topic/263f6e5a915f430894ee290040e7e220
    { ns: TEMPLATING_NS, name: "require" },
    // See: https://sapui5.hana.ondemand.com/#/topic/91f0c3ee6f4d1014b6dd926db0e91070
    { ns: CUSTOM_DATA_NS, name: ALL_ATTRIBUTE_NAMES },
  ];

  if (
    find(
      ALWAYS_VALID_ATTRIBUTES,
      (validAttribute) =>
        validAttribute.ns === ns &&
        (validAttribute.name === ALL_ATTRIBUTE_NAMES ||
          validAttribute.name === name)
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
  // The following attributes are valid on all classes/the specified class
  // They shouldn't be offered for code completion so we just ignore them in the validation (instead of adding them to the model)
  const ALL_CLASSES = undefined;
  const ALWAYS_VALID_CLASS_ATTRIBUTES = [
    // "class" attribute can be used on all Controls and selected Elements
    // See: https://sapui5.hana.ondemand.com/#/topic/b564935324f449209354c7e2f9903f22
    { name: "class", classFQN: ALL_CLASSES },
    // "binding" is a synonym for "objectBindings" special setting on ManagedObject
    // See: https://sapui5.hana.ondemand.com/#/topic/91f05e8b6f4d1014b6dd926db0e91070
    { name: "binding", classFQN: ALL_CLASSES },
    // Technically the "stashed" attribute can be under any Element but it should only be used
    // for sap.uxap.ObjectPageLazyLoader
    // See: https://sapui5.hana.ondemand.com/#/api/sap.uxap.ObjectPageLazyLoader
    { name: "stashed", classFQN: "sap.uxap.ObjectPageLazyLoader" },
  ];

  if (
    find(
      ALWAYS_VALID_CLASS_ATTRIBUTES,
      (validAttribute) =>
        validAttribute.name === attribute.key &&
        (validAttribute.classFQN === ALL_CLASSES ||
          validAttribute.classFQN === ui5NodeToFQN(ui5Class))
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
  attribute: XMLAttribute & { key: string }
): { ns: string | undefined; name: string } {
  const { prefix, localName } = splitQNameByNamespace(attribute.key);
  if (prefix === undefined) {
    return { ns: prefix, name: localName };
  }
  const resolvedNS = attribute.parent.namespaces[prefix];
  return {
    ns: resolvedNS,
    name: localName,
  };
}

import { UnknownTagNameIssue } from "../../../api";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { XMLElement, XMLToken } from "@xml-tools/ast";
import {
  getUI5ClassByXMLElement,
  ui5NodeToFQN,
  getUI5NodeFromXMLElementNamespace,
  getUI5AggregationByXMLElement,
} from "@ui5-language-assistant/logic-utils";
import {
  getMessage,
  UNKNOWN_CLASS_IN_NS,
  UNKNOWN_CLASS_WITHOUT_NS,
  UNKNOWN_AGGREGATION_IN_CLASS,
  UNKNOWN_TAG_NAME_IN_CLASS,
} from "../../utils/messages";

export function validateUnknownTagName(
  xmlElement: XMLElement,
  model: UI5SemanticModel
): UnknownTagNameIssue[] {
  // Can't give an error if there is no position
  if (xmlElement.syntax.openName == undefined || xmlElement.name === null) {
    return [];
  }

  // To avoid false positives, we only validate tags with recognized namespaces (from the model)
  // or without a namespace (and for tags without a namespace, we only validate if
  // they cannot be user-defined classes or aggregations).

  // Get the namespace
  if (xmlElement.ns !== undefined) {
    // The cast is necessary because typescript doesn't recognize the conditions above as type guards
    return validateTagWithNamespace(xmlElement as NamedXMLElementWithNS, model);
  } else {
    // The cast is necessary because typescript doesn't recognize the condition above as a type guard
    return validateTagWithoutNamespace(xmlElement as NamedXMLElement, model);
  }
}

type NamedXMLElement = XMLElement & {
  name: string;
  syntax: { openName: XMLToken };
};
type NamedXMLElementWithNS = NamedXMLElement & { ns: string };

function validateTagWithNamespace(
  xmlElement: NamedXMLElementWithNS,
  model: UI5SemanticModel
): UnknownTagNameIssue[] {
  const issueDefaults = {
    kind: "UnknownTagName" as "UnknownTagName",
    offsetRange: {
      start: xmlElement.syntax.openName.startOffset,
      end: xmlElement.syntax.openName.endOffset,
    },
    severity: "error" as "error",
  };

  // To avoid false positives, we assume unrecognized namespaces are user-defined so we don't validate tags in them
  // (they could be user-defined class tags).
  // They could also be valid special namespaces like xhtml.
  // TODO There should be an error in xml-tools if the namespace is not defined in an xmlns attribute
  const { namespace: ui5Namespace } = getUI5NodeFromXMLElementNamespace(
    xmlElement,
    model
  );
  if (ui5Namespace === undefined) {
    return [];
  }

  // Check if it's a known class (aggregations don't have namespaces)
  const ui5Class = getUI5ClassByXMLElement(xmlElement, model);
  if (ui5Class !== undefined) {
    return [];
  }

  return [
    {
      ...issueDefaults,
      message: getMessage(
        UNKNOWN_CLASS_IN_NS,
        xmlElement.name,
        ui5NodeToFQN(ui5Namespace)
      ),
    },
  ];
}

function validateTagWithoutNamespace(
  xmlElement: NamedXMLElement,
  model: UI5SemanticModel
): UnknownTagNameIssue[] {
  const issueDefaults = {
    kind: "UnknownTagName" as "UnknownTagName",
    offsetRange: {
      start: xmlElement.syntax.openName.startOffset,
      end: xmlElement.syntax.openName.endOffset,
    },
    severity: "error" as "error",
  };

  // If the default namespace is defined and it's not a known namespace, don't validate
  // (it could be a custom class tag or a special namespace like xhtml or template)
  const {
    namespace: ui5Namespace,
    isXmlnsDefined,
  } = getUI5NodeFromXMLElementNamespace(xmlElement, model);
  if (isXmlnsDefined && ui5Namespace === undefined) {
    return [];
  }

  // Check if it's a known class or aggregation
  if (
    getUI5ClassByXMLElement(xmlElement, model) !== undefined ||
    getUI5AggregationByXMLElement(xmlElement, model) !== undefined
  ) {
    return [];
  }

  // This is an unrecognized element on a non-custom (or undefined) default namespace.
  // Try to find out what this element can be.
  if (xmlElement.parent.type === "XMLDocument") {
    // If it's the root tag, it can only be a class
    let message: string;
    if (ui5Namespace !== undefined) {
      message = getMessage(
        UNKNOWN_CLASS_IN_NS,
        xmlElement.name,
        ui5NodeToFQN(ui5Namespace)
      );
    } else {
      message = getMessage(UNKNOWN_CLASS_WITHOUT_NS, xmlElement.name);
    }
    return [
      {
        ...issueDefaults,
        message,
      },
    ];
  }

  // Check if the parent is a recognized class
  const parentUI5Class = getUI5ClassByXMLElement(xmlElement.parent, model);
  if (parentUI5Class !== undefined) {
    // If the parent class has a default aggregation, this could be a class. Otherwise it must be an aggregation.
    if (parentUI5Class.defaultAggregation === undefined) {
      return [
        {
          ...issueDefaults,
          message: getMessage(
            UNKNOWN_AGGREGATION_IN_CLASS,
            xmlElement.name,
            ui5NodeToFQN(parentUI5Class)
          ),
        },
      ];
    } else {
      return [
        {
          ...issueDefaults,
          message: getMessage(
            UNKNOWN_TAG_NAME_IN_CLASS,
            xmlElement.name,
            ui5NodeToFQN(parentUI5Class)
          ),
        },
      ];
    }
  }

  // Check if the parent is a recognized aggregation
  const parentUI5Aggregation = getUI5AggregationByXMLElement(
    xmlElement.parent,
    model
  );
  if (parentUI5Aggregation !== undefined) {
    // Only classes can appear under aggregations
    let message: string;
    if (ui5Namespace !== undefined) {
      message = getMessage(
        UNKNOWN_CLASS_IN_NS,
        xmlElement.name,
        ui5NodeToFQN(ui5Namespace)
      );
    } else {
      message = getMessage(UNKNOWN_CLASS_WITHOUT_NS, xmlElement.name);
    }
    return [
      {
        ...issueDefaults,
        message,
      },
    ];
  }

  // It might be an aggregation name under a custom class, so we don't give an error to avoid false positives
  return [];
}

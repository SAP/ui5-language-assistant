import { UnknownTagNameIssue } from "../../../api";
import {
  UI5SemanticModel,
  BaseUI5Node,
  UI5Class,
} from "@ui5-language-assistant/semantic-model-types";
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
  UNKNOWN_AGGREGATION_IN_CLASS_DIFF_NAMESPACE,
  UNKNOWN_TAG_NAME_IN_CLASS,
  UNKNOWN_TAG_NAME_IN_NS_UNDER_CLASS,
  UNKNOWN_TAG_NAME_IN_NS,
  UNKNOWN_TAG_NAME_NO_NS,
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
  // They could also be valid special namespaces like xhtml or template.
  // TODO There should be an error in xml-tools if the namespace is not defined in an xmlns attribute
  const { namespace: ui5Namespace } = getUI5NodeFromXMLElementNamespace(
    xmlElement,
    model
  );
  if (ui5Namespace === undefined) {
    return [];
  }

  // Check if it's a known class or aggregaion
  if (
    getUI5ClassByXMLElement(xmlElement, model) !== undefined ||
    getUI5AggregationByXMLElement(xmlElement, model) !== undefined
  ) {
    return [];
  }

  // This is an unrecognized element on a non-custom namespace.
  // Try to find out what this element was supposed to be to give the most accurate error message.

  // Check if it could be an aggregation:
  // Aggregations cannot be the root element and cannot be under another aggregation.
  // Aggregations are always in the parent element (class) namespace.
  //
  if (
    xmlElement.parent.type === "XMLElement" &&
    xmlElement.parent.ns === xmlElement.ns &&
    getUI5AggregationByXMLElement(xmlElement.parent, model) === undefined
  ) {
    return [
      {
        ...issueDefaults,
        message: getUnknownTagNameMessage(
          xmlElement.name,
          ui5Namespace,
          getUI5ClassByXMLElement(xmlElement.parent, model)
        ),
      },
    ];
  }

  // If it's not an aggregation it can only be a class
  return [
    {
      ...issueDefaults,
      message: getUnknownClassMessage(xmlElement.name, ui5Namespace),
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
  // Try to find out what this element was supposed to be to give the most accurate error message.

  // If it's the root tag, it can only be a class
  if (xmlElement.parent.type === "XMLDocument") {
    return [
      {
        ...issueDefaults,
        message: getUnknownClassMessage(xmlElement.name, ui5Namespace),
      },
    ];
  }

  // Check if the parent is a recognized class
  const parentUI5Class = getUI5ClassByXMLElement(xmlElement.parent, model);
  if (parentUI5Class !== undefined) {
    // If the parent class doesn't have a default aggregation, it can only contain aggregations under it
    if (parentUI5Class.defaultAggregation === undefined) {
      return [
        {
          ...issueDefaults,
          message: getUnknownAggregationMessage(
            xmlElement.name,
            xmlElement.ns,
            parentUI5Class,
            xmlElement.parent.ns
          ),
        },
      ];
    } else {
      // It could be a class or an aggregation
      return [
        {
          ...issueDefaults,
          message: getUnknownTagNameMessage(
            xmlElement.name,
            ui5Namespace,
            parentUI5Class
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
    return [
      {
        ...issueDefaults,
        message: getUnknownClassMessage(xmlElement.name, ui5Namespace),
      },
    ];
  }

  // We don't know what the parent tag is.
  // Since the tag doesn't have a namespace, and there is either a recognized default namespace or no default namespace,
  // we can conclude that this tag is not a custom class, and that it's not an aggregation of a custom class
  // (since aggregations must have the same namespace as their parent tag, and we know that the namespace is not custom).
  return [
    {
      ...issueDefaults,
      message: getUnknownTagNameMessage(
        xmlElement.name,
        ui5Namespace,
        undefined
      ),
    },
  ];
}

function getUnknownClassMessage(
  name: string,
  ui5Namespace: BaseUI5Node | undefined
): string {
  if (ui5Namespace !== undefined) {
    return getMessage(UNKNOWN_CLASS_IN_NS, name, ui5NodeToFQN(ui5Namespace));
  }
  return getMessage(UNKNOWN_CLASS_WITHOUT_NS, name);
}

function getUnknownAggregationMessage(
  name: string,
  ns: string | undefined,
  ui5Class: UI5Class,
  classNS: string | undefined
): string {
  // Aggregations must be in the same namespace as the class
  if (ns !== classNS) {
    return getMessage(
      UNKNOWN_AGGREGATION_IN_CLASS_DIFF_NAMESPACE,
      name,
      ui5NodeToFQN(ui5Class)
    );
  }
  return getMessage(UNKNOWN_AGGREGATION_IN_CLASS, name, ui5NodeToFQN(ui5Class));
}

function getUnknownTagNameMessage(
  name: string,
  ui5Namespace: BaseUI5Node | undefined,
  parentUI5Class: UI5Class | undefined
): string {
  if (parentUI5Class !== undefined && ui5Namespace !== undefined) {
    return getMessage(
      UNKNOWN_TAG_NAME_IN_NS_UNDER_CLASS,
      name,
      ui5NodeToFQN(ui5Namespace),
      ui5NodeToFQN(parentUI5Class)
    );
  } else if (parentUI5Class !== undefined && ui5Namespace === undefined) {
    return getMessage(
      UNKNOWN_TAG_NAME_IN_CLASS,
      name,
      ui5NodeToFQN(parentUI5Class)
    );
  } else if (parentUI5Class === undefined && ui5Namespace !== undefined) {
    return getMessage(UNKNOWN_TAG_NAME_IN_NS, name, ui5NodeToFQN(ui5Namespace));
  } else {
    return getMessage(UNKNOWN_TAG_NAME_NO_NS, name);
  }
}

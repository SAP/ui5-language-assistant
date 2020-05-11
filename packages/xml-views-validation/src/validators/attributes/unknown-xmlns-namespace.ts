import { XMLAttribute } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { findSymbol } from "@ui5-language-assistant/semantic-model";
import { UnknownNamespaceInXmlnsAttributeValueIssue } from "../../../api";
import { isXMLNamespaceKey } from "@ui5-language-assistant/logic-utils";

export function validateUnknownXmlnsNamespace(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): UnknownNamespaceInXmlnsAttributeValueIssue[] {
  const attributeName = attribute.key;
  if (attributeName === null || !isXMLNamespaceKey(attributeName)) {
    return [];
  }

  const attributeValue = attribute.value;
  const attributeValueToken = attribute.syntax.value;

  // Only check sap.* values so we don't give errors on custom namespaces (and namespaces that start with "http" which could also be valid).
  // TODO empty namespaces aren't valid but this should be handled in xml-tools because it's a general xml issue.
  if (
    attributeValueToken === undefined ||
    attributeValue === null ||
    !attributeValue.startsWith("sap.")
  ) {
    return [];
  }

  // Find the namespace. In most cases it would actually be a namespace but some classes are defined inside other things
  // (e.g. sap.gantt.legend which is an Enum in 1.71.*)
  if (findSymbol(model, attributeValue) === undefined) {
    return [
      {
        kind: "UnknownNamespaceInXmlnsAttributeValue",
        message: `Unknown namespace: ${attributeValueToken.image}`,
        offsetRange: {
          start: attributeValueToken.startOffset,
          end: attributeValueToken.endOffset,
        },
        severity: "warn",
      },
    ];
  }

  return [];
}

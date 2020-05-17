import { XMLAttribute } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { findSymbol } from "@ui5-language-assistant/semantic-model";
import { isXMLNamespaceKey } from "@xml-tools/common";
import { UnknownNamespaceInXmlnsAttributeValueIssue } from "../../../api";
import { find } from "lodash";

export function validateUnknownXmlnsNamespace(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): UnknownNamespaceInXmlnsAttributeValueIssue[] {
  const attributeName = attribute.key;
  if (
    attributeName === null ||
    !isXMLNamespaceKey({ key: attributeName, includeEmptyPrefix: true })
  ) {
    return [];
  }

  const attributeValue = attribute.value;
  const attributeValueToken = attribute.syntax.value;

  // TODO empty namespaces aren't valid but this should be handled in xml-tools because it's a general xml issue.
  if (attributeValueToken === undefined || attributeValue === null) {
    return [];
  }

  // Only check namespaces from libraries.
  // There are valid namespaces like some that start with "http" that should not return an error.
  // Additionally, customers can develop in custom namespaces, even those that start with "sap", and we don't want to give false positives.
  // But sap library namespaces (i.e. first-level namespaces under "sap") can be considered reserved.
  /* istanbul ignore next - defensive programming - "sap" namespace should always exist in production scenarios */
  const reservedNamespaceRoots = model.namespaces["sap"]?.namespaces;
  if (
    find(reservedNamespaceRoots, (_, fqn) =>
      attributeValue.startsWith(fqn + ".")
    ) === undefined
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

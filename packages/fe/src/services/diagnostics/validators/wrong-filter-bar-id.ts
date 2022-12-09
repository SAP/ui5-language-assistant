import { XMLAttribute, XMLElement } from "@xml-tools/ast";
import {
  getUI5ClassByXMLElement,
  getUI5PropertyByXMLAttributeKey,
} from "@ui5-language-assistant/logic-utils";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { Context } from "@ui5-language-assistant/context";
import { isPossibleBindingAttributeValue } from "@ui5-language-assistant/xml-views-validation";
import { AnnotationIssue } from "../../../api";
import { ANNOTATION_ISSUE_TYPE, SAP_FE_MACROS } from "../../../types";

/**
 * Checks filterBar attribute value referencing id of existing FilterBar macros element
 */
export function validateFilterBarId(
  attribute: XMLAttribute,
  context: Context
): AnnotationIssue[] {
  const actualAttributeValue = attribute.value;
  const actualAttributeValueToken = attribute.syntax.value;
  if (
    actualAttributeValue === null ||
    actualAttributeValueToken === undefined ||
    isPossibleBindingAttributeValue(actualAttributeValue)
  ) {
    return [];
  }

  const ui5Property = getUI5PropertyByXMLAttributeKey(
    attribute,
    context.ui5Model
  );

  if (
    ui5Property?.library === SAP_FE_MACROS &&
    ui5Property.name === "filterBar"
  ) {
    const root = getRootElement(attribute.parent);
    const ids = collectFilterBarElements(root, context.ui5Model);
    if (!ids.includes(attribute.value || "")) {
      if (attribute.value) {
        return [
          {
            kind: "UnknownEnumValue",
            issueType: ANNOTATION_ISSUE_TYPE,
            message: `FilterBar with id "${attribute.value}" does not exist.${
              ids.length
                ? " Trigger code completion to choose one of existing FilterBar ids"
                : ""
            }`,
            offsetRange: {
              start: actualAttributeValueToken.startOffset,
              end: actualAttributeValueToken.endOffset,
            },
            severity: "warn",
          },
        ];
      } else if (ids.length) {
        return [
          {
            kind: "UnknownEnumValue",
            issueType: ANNOTATION_ISSUE_TYPE,
            message: `Trigger code completion to choose one of existing FilterBar ids`,
            offsetRange: {
              start: actualAttributeValueToken.startOffset,
              end: actualAttributeValueToken.endOffset,
            },
            severity: "warn",
          },
        ];
      }
    }
  }

  return [];
}

function getRootElement(element: XMLElement): XMLElement {
  let current: XMLElement = element;
  while (current.parent.type === "XMLElement") {
    current = current.parent;
  }
  return current;
}

function collectFilterBarElements(
  element: XMLElement,
  model: UI5SemanticModel
): string[] {
  const ids: string[] = [];
  for (const child of element.subElements) {
    const ui5Class = getUI5ClassByXMLElement(child, model);
    if (ui5Class?.name === "FilterBar" && ui5Class.library === SAP_FE_MACROS) {
      const id = child.attributes.find((attribute) => attribute.key === "id")
        ?.value;
      if (id) {
        ids.push(id);
      }
    } else {
      const childIds = collectFilterBarElements(child, model);
      if (childIds.length) {
        Array.prototype.push.apply(ids, childIds);
      }
    }
  }

  return ids;
}

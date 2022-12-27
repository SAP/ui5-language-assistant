import { XMLElement } from "@xml-tools/ast";
import {
  getUI5ClassByXMLElement,
  getUI5PropertyByXMLAttributeKey,
} from "@ui5-language-assistant/logic-utils";
import { UI5AttributeValueCompletionOptions } from "./index";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  FilterBarIdInXMLAttributeValueCompletion,
  FilterBarIdInXMLAttributeValueTypeName,
} from "../../../types/completion";
import { SAP_FE_MACROS } from "../../../types";
import { getAffectedRange } from "../utils";

/**
 * Suggests values for macros Table attribute FilterBar referencing FilterBar macros element
 */
export function filterBarAttributeSuggestions({
  element,
  attribute,
  context,
}: UI5AttributeValueCompletionOptions): FilterBarIdInXMLAttributeValueCompletion[] {
  const ui5Property = getUI5PropertyByXMLAttributeKey(
    attribute,
    context.ui5Model
  );

  if (
    ui5Property?.library === SAP_FE_MACROS &&
    ui5Property.name === "filterBar"
  ) {
    const root = getRootElement(element);
    const ids = collectFilterBarElements(root, context.ui5Model);
    return ids.map((id) => ({
      type: FilterBarIdInXMLAttributeValueTypeName,
      node: {
        kind: "FilterBarId",
        name: id,
        text: id,
        affectedRange: getAffectedRange(attribute.syntax.value),
      },
    }));
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

import { some, includes } from "lodash";
import { XMLElement } from "@xml-tools/ast";
import {
  getUI5ClassByXMLElement,
  ui5NodeToFQN,
  resolveXMLNS,
} from "@ui5-language-assistant/logic-utils";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { NonStableIDIssue } from "../../../api";
import { NON_STABLE_ID, getMessage } from "../../utils/messages";
import { isCustomClass } from "../../utils/custom-class";
import { CORE_NS } from "../../utils/special-namespaces";

export function validateNonStableId(
  xmlElement: XMLElement,
  model: UI5SemanticModel
): NonStableIDIssue[] {
  // Can't give an error if there is no position or name
  if (xmlElement.name === null || xmlElement.syntax.openName === undefined) {
    return [];
  }

  if (isWhiteListed(xmlElement, model)) {
    return [];
  }

  if (!isCustomClass(xmlElement)) {
    return [];
  }

  if (
    hasNonAdaptableMetaData(xmlElement) ||
    hasNonAdaptableTreeMetaData(xmlElement)
  ) {
    return [];
  }

  if (isElementWithStableID(xmlElement)) {
    return [];
  }

  const nonStableIDIssue: NonStableIDIssue = {
    kind: "NonStableIDIssue",
    message: getMessage(NON_STABLE_ID, xmlElement.name),
    severity: "error",
    offsetRange: {
      start: xmlElement.syntax.openName.startOffset,
      end: xmlElement.syntax.openName.endOffset,
    },
  };

  return [nonStableIDIssue];
}

function isWhiteListed(
  xmlElement: XMLElement,
  model: UI5SemanticModel
): boolean {
  const ui5Class = getUI5ClassByXMLElement(xmlElement, model);

  const coreNsRootClassExceptions = ["View", "FragmentDefinition"];

  // The class is in the root level
  if (
    xmlElement.parent.type === "XMLDocument" &&
    ui5Class !== undefined &&
    ui5NodeToFQN(ui5Class) === "sap.ui.core.mvc.View"
  ) {
    return true;
  } else if (
    xmlElement.parent.type === "XMLDocument" &&
    resolveXMLNS(xmlElement) === CORE_NS &&
    includes(coreNsRootClassExceptions, xmlElement.name)
  ) {
    return true;
  }

  const classExceptions = ["Fragment", "CustomData", "ExtensionPoint"];

  const isWhiteListed =
    resolveXMLNS(xmlElement) === CORE_NS &&
    includes(classExceptions, xmlElement.name);
  return isWhiteListed;
}

function hasNonAdaptableMetaData(xmlElement: XMLElement): boolean {
  return some(
    xmlElement.attributes,
    (attribute) =>
      attribute.key === "sap.ui.dt:designtime" &&
      attribute.value === "not-adaptable"
  );
}

function hasNonAdaptableTreeMetaData(xmlElement: XMLElement): boolean {
  let currElement = xmlElement;
  while (currElement.parent.type !== "XMLDocument") {
    const hasNonAdaptableTreeMetaData = some(
      currElement.attributes,
      (attribute) =>
        attribute.key === "sap.ui.dt:designtime" &&
        attribute.value === "not-adaptable-tree"
    );

    if (hasNonAdaptableTreeMetaData) {
      return true;
    }

    currElement = currElement.parent;
  }

  return false;
}

function isElementWithStableID(xmlElement: XMLElement): boolean {
  return some(
    xmlElement.attributes,
    (attribute) =>
      attribute.key === "id" &&
      attribute.value !== null &&
      /\S/.test(attribute.value)
  );
}

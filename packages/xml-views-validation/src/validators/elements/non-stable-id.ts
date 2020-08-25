import { some, includes } from "lodash";
import { XMLElement } from "@xml-tools/ast";
import { resolveXMLNS } from "@ui5-language-assistant/logic-utils";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  validations,
  buildMessage,
} from "@ui5-language-assistant/user-facing-text";
import { NonStableIDIssue } from "../../../api";
import {
  isPossibleCustomClass,
  isKnownUI5Class,
} from "../../utils/ui5-classes";
import { CORE_NS } from "../../utils/special-namespaces";

const { NON_STABLE_ID } = validations;

export function validateNonStableId(
  xmlElement: XMLElement,
  model: UI5SemanticModel
): NonStableIDIssue[] {
  // Can't give an error if there is no position or name
  if (xmlElement.name === null || xmlElement.syntax.openName === undefined) {
    return [];
  }

  if (isWhiteListedTag(xmlElement)) {
    return [];
  }

  if (
    // @ts-expect-error - we already checked that xmlElement.name is not null
    !isPossibleCustomClass(xmlElement) &&
    !isKnownUI5Class(xmlElement, model)
  ) {
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
    message: buildMessage(NON_STABLE_ID.msg, xmlElement.name),
    severity: "error",
    offsetRange: {
      start: xmlElement.syntax.openName.startOffset,
      end: xmlElement.syntax.openName.endOffset,
    },
  };

  return [nonStableIDIssue];
}

function isWhiteListedTag(xmlElement: XMLElement): boolean {
  const rootWhiteListedExceptions: Record<string, string[]> = {
    "sap.ui.core.mvc": ["View"],
    "sap.ui.core": ["View", "FragmentDefinition"],
  };

  // The class is in the root level
  if (xmlElement.parent.type === "XMLDocument") {
    const resolvedXMLNS = resolveXMLNS(xmlElement);
    // @ts-expect-error - it's fine to use undefined in member access
    const exceptionsForResolvedXMLNS = rootWhiteListedExceptions[resolvedXMLNS];
    if (includes(exceptionsForResolvedXMLNS, xmlElement.name)) {
      return true;
    }
  }

  const coreNsWhiteListedExceptions = [
    "Fragment",
    "CustomData",
    "ExtensionPoint",
  ];

  const isCoreNsWhiteListed =
    resolveXMLNS(xmlElement) === CORE_NS &&
    includes(coreNsWhiteListedExceptions, xmlElement.name);
  return isCoreNsWhiteListed;
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
        //TODO - inspect if we need to properly resolve the attribute "NS" / use plain string matcher
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
      // Contains a single non ws character
      /\S/.test(attribute.value)
  );
}

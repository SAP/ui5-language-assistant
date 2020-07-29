import {
  some,
  includes,
  map,
  isSafeInteger,
  isNaN,
  toString,
  find,
  replace,
  isEmpty,
} from "lodash";
import {
  XMLElement,
  XMLDocument,
  accept,
  XMLAstVisitor,
  XMLToken,
  XMLAttribute,
} from "@xml-tools/ast";
import { resolveXMLNS } from "@ui5-language-assistant/logic-utils";
import { NonStableIDIssue, OffsetRange } from "../../../api";
import { NON_STABLE_ID, getMessage } from "../../utils/messages";
import {
  isPossibleCustomClass,
  isKnownUI5Class,
} from "../../utils/ui5-classes";
import { CORE_NS } from "../../utils/special-namespaces";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";

type NonStableIDElement = XMLElement & {
  name: string;
  syntax: { openName: XMLToken };
};

const ID_PREFFIX_PATTERN_SUGGESTION = "_IDEGen";
const ID_PREFIX_PATTERN = "^_IDEGen";
const ID_SUFFIX_PATTERN = "(\\d+$)?";

export function validateNonStableId(
  xmlDoc: XMLDocument,
  model: UI5SemanticModel
): NonStableIDIssue[] {
  const missingIdElements = new NonStableIdCollectorVisitor(model);
  accept(xmlDoc, missingIdElements);

  const nonStableIdElementsCollector = missingIdElements.nonStableIdElements;
  if (isEmpty(nonStableIdElementsCollector)) {
    return [];
  }

  const biggestIdsCollector = new IdsByElementNameCollectorVisitor();
  accept(xmlDoc, biggestIdsCollector);
  const biggestIdNumbersOfXMLElements =
    biggestIdsCollector.biggestIdsOfElements;

  const allNonStableIdIsuues: NonStableIDIssue[] = buildIssuesForElements(
    nonStableIdElementsCollector,
    biggestIdNumbersOfXMLElements
  );

  return allNonStableIdIsuues;
}

function buildIssuesForElements(
  nonStableIdElements: NonStableIDElement[],
  biggestIdsOflements: Record<string, number>
): NonStableIDIssue[] {
  const issuesForElements = map(nonStableIdElements, (currentElement) => {
    const nonStableIDIssue: NonStableIDIssue = {
      kind: "NonStableIDIssue",
      quickFixIdSuggestion: getQuickFixIdSuggestion(
        currentElement,
        biggestIdsOflements
      ),
      quickFixIdRange: getQuickFixIdRange(currentElement),
      message: getMessage(NON_STABLE_ID, currentElement.name),
      severity: "error",
      offsetRange: {
        start: currentElement.syntax.openName.startOffset,
        end: currentElement.syntax.openName.endOffset,
      },
    };

    return nonStableIDIssue;
  });

  return issuesForElements;
}

function getQuickFixIdRange(xmlElement: NonStableIDElement): OffsetRange {
  const idAttrib = find(xmlElement.attributes, (attrib) => attrib.key === "id");
  if (idAttrib !== undefined) {
    return {
      start: idAttrib.position.startOffset,
      end: idAttrib.position.endOffset + 1,
    };
  }

  return {
    start: xmlElement.syntax.openName.endOffset + 2,
    end: xmlElement.syntax.openName.endOffset + 1,
  };
}

class NonStableIdCollectorVisitor implements XMLAstVisitor {
  public nonStableIdElements: NonStableIDElement[] = [];

  constructor(private model: UI5SemanticModel) {}

  visitXMLElement(xmlElement: XMLElement) {
    if (
      xmlElement.name !== null &&
      xmlElement.syntax.openName !== undefined &&
      !isWhiteListedTag(xmlElement) &&
      (isKnownUI5Class(xmlElement, this.model) ||
        // @ts-expect-error - we already checked that xmlElement.name is not null
        isPossibleCustomClass(xmlElement)) &&
      !hasNonAdaptableMetaData(xmlElement) &&
      !hasNonAdaptableTreeMetaData(xmlElement) &&
      !isElementWithStableID(xmlElement)
    ) {
      // @ts-expect-error - TSC does not understand: `xmlElement.syntax.openName !== undefined` is a type guard
      this.nonStableIdElements.push(xmlElement);
    }
  }
}

class IdsByElementNameCollectorVisitor implements XMLAstVisitor {
  public biggestIdsOfElements: Record<string, number> = Object.create(null);

  visitXMLAttribute(xmlAttribute: XMLAttribute) {
    const parentName = xmlAttribute.parent.name;
    const elementIdPattern = new RegExp(
      ID_PREFIX_PATTERN + parentName + ID_SUFFIX_PATTERN
    );

    if (
      xmlAttribute.key === "id" &&
      xmlAttribute.value !== null &&
      parentName !== null &&
      elementIdPattern.test(xmlAttribute.value)
    ) {
      const matchSuffix = /\d+$/.exec(xmlAttribute.value);
      const suffix = matchSuffix ? parseInt(matchSuffix[0]) : 0;
      if (
        this.biggestIdsOfElements[parentName] === undefined ||
        suffix > this.biggestIdsOfElements[parentName]
      ) {
        this.biggestIdsOfElements[parentName] = suffix;
      }
    }
  }
}

function getQuickFixIdSuggestion(
  xmlElement: NonStableIDElement,
  biggestIdsOfElements: Record<string, number>
): string {
  const biggestIdForElement = biggestIdsOfElements[xmlElement.name];
  const quickFixIdSuffix = biggestIdForElement
    ? toString(biggestIdForElement + 1)
    : "";
  const quickFixIdSuggestion = `${ID_PREFFIX_PATTERN_SUGGESTION}${xmlElement.name}${quickFixIdSuffix}`;

  return quickFixIdSuggestion;
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

import { reject, flatMap, map, pickBy } from "lodash";
import {
  accept,
  XMLAstVisitor,
  XMLAttribute,
  XMLDocument,
  XMLToken,
} from "@xml-tools/ast";
import { resolveXMLNS } from "@ui5-language-assistant/logic-utils";
import { NonUniqueIDIssue } from "../../../api";
import {
  SVG_NS,
  TEMPLATING_NS,
  XHTML_NS,
} from "../../utils/special-namespaces";
import { getMessage, NON_UNIQUE_ID } from "../../utils/messages";

export function validateNonUniqueID(xmlDoc: XMLDocument): NonUniqueIDIssue[] {
  const idCollector = new IdsCollectorVisitor();
  accept(xmlDoc, idCollector);
  const idsToXMLElements = idCollector.idsToXMLElements;
  const duplicatedIdsRecords = pickBy(idsToXMLElements, (_) => _.length > 1);

  const allIDsIssues: NonUniqueIDIssue[] = flatMap(
    duplicatedIdsRecords,
    buildIssuesForSingleID
  );

  return allIDsIssues;
}

function buildIssuesForSingleID(
  duplicatedAttributes: DuplicatedIDXMLAttribute[],
  id: string
): NonUniqueIDIssue[] {
  const issuesForID = map(
    duplicatedAttributes,
    (currDupAttrib, currAttribIdx) => {
      const currDupIdValToken = currDupAttrib.syntax.value;
      // Related issues must not include the "main" issue attribute
      const relatedOtherDupIDAttribs = reject(
        duplicatedAttributes,
        (_, arrIdx) => arrIdx === currAttribIdx
      );

      return {
        kind: "NonUniqueIDIssue" as "NonUniqueIDIssue",
        message: getMessage(NON_UNIQUE_ID, id),
        severity: "error" as "error",
        offsetRange: {
          start: currDupIdValToken.startOffset,
          end: currDupIdValToken.endOffset,
        },
        identicalIDsRanges: map(relatedOtherDupIDAttribs, (_) => ({
          start: _.syntax.value.startOffset,
          end: _.syntax.value.endOffset,
        })),
      };
    }
  );

  return issuesForID;
}

type DuplicatedIDXMLAttribute = XMLAttribute & { syntax: { value: XMLToken } };

class IdsCollectorVisitor implements XMLAstVisitor {
  public idsToXMLElements: Record<
    string,
    DuplicatedIDXMLAttribute[]
  > = Object.create(null);

  visitXMLAttribute(attrib: XMLAttribute): void {
    if (
      attrib.key === "id" &&
      attrib.value !== null &&
      attrib.value !== "" &&
      attrib.syntax.value !== undefined &&
      attrib.parent.name !== null &&
      // Heuristic to limit false positives by only checking tags starting with upper
      // case names, This would **mostly** limit the checks for things that can actually be
      // UI5 Elements / Controls.
      /^[A-Z]/.test(attrib.parent.name) &&
      !isNoneUI5id(attrib)
    ) {
      if (this.idsToXMLElements[attrib.value] === undefined) {
        // @ts-ignore - TSC does not understand: `attrib.syntax.value !== undefined` is a type guard
        this.idsToXMLElements[attrib.value] = [attrib];
      } else {
        // @ts-ignore - TSC does not understand: `attrib.syntax.value !== undefined` is a type guard
        this.idsToXMLElements[attrib.value].push(attrib);
      }
    }
  }
}

// We only care about UI5 elements/controls IDs when check non-unique IDs
// `id` attributes in these: **known** namespaces which are sometimes used
// in UI5 xml-views are definitively not relevant for this validation
const whiteListedNamespaces: Record<string, boolean> = {
  [SVG_NS]: true,
  [TEMPLATING_NS]: true,
  [XHTML_NS]: true,
};
Object.freeze(whiteListedNamespaces);

function isNoneUI5id(attrib: XMLAttribute): boolean {
  const parentElement = attrib.parent;
  const parentResolvedNamespace = resolveXMLNS(parentElement);
  if (parentResolvedNamespace === undefined) {
    return false;
  }
  return whiteListedNamespaces[parentResolvedNamespace];
}

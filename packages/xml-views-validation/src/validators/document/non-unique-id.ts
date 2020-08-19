import { reject, flatMap, map, pickBy } from "lodash";
import {
  accept,
  XMLAstVisitor,
  XMLAttribute,
  XMLDocument,
  XMLToken,
} from "@xml-tools/ast";
import {
  validations,
  buildMessage,
} from "@ui5-language-assistant/user-facing-text";
import { NonUniqueIDIssue } from "../../../api";
import { isPossibleCustomClass } from "../../utils/ui5-classes";

const { NON_UNIQUE_ID } = validations;

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
        kind: "NonUniqueIDIssue" as const,
        message: buildMessage(NON_UNIQUE_ID.msg, id),
        severity: "error" as const,
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
      // @ts-expect-error - we already checked that xmlElement.name is not null
      isPossibleCustomClass(attrib.parent)
    ) {
      if (this.idsToXMLElements[attrib.value] === undefined) {
        // @ts-expect-error - TSC does not understand: `attrib.syntax.value !== undefined` is a type guard
        this.idsToXMLElements[attrib.value] = [attrib];
      } else {
        // @ts-expect-error - TSC does not understand: `attrib.syntax.value !== undefined` is a type guard
        this.idsToXMLElements[attrib.value].push(attrib);
      }
    }
  }
}

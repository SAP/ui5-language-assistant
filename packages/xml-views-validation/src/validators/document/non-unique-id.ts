import { flatMap, map, pickBy, mapValues, filter } from "lodash";
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
import { Context } from "@ui5-language-assistant/context";
import { locationToRange } from "../../utils/range";

const { NON_UNIQUE_ID } = validations;
type DuplicatedIDXMLAttribute = XMLAttribute & { syntax: { value: XMLToken } };
interface IDCollector {
  attribute: DuplicatedIDXMLAttribute;
  documentPath: string;
}

export function validateNonUniqueID(
  xmlDoc: XMLDocument,
  context: Context
): NonUniqueIDIssue[] {
  const idCollector = new IdsCollectorVisitor();
  const files = Object.keys(context.viewFiles);
  for (const docPath of files) {
    idCollector.documentPath = docPath;
    accept(context.viewFiles[docPath], idCollector);
  }
  const idsToXMLElements = idCollector.idsToXMLElements;
  const duplicatedIdsRecords = pickBy(idsToXMLElements, (_) => _.length > 1);
  const currentDocDuplicateIssueRecords = mapValues(
    duplicatedIdsRecords,
    (entry) => filter(entry, (i) => i.documentPath === context.documentPath)
  );

  const otherDocsDuplicateIssueRecords = mapValues(
    duplicatedIdsRecords,
    (entry) => filter(entry, (i) => i.documentPath !== context.documentPath)
  );
  const allIDsIssues = flatMap<Record<string, IDCollector[]>, NonUniqueIDIssue>(
    currentDocDuplicateIssueRecords,
    (entry, index) => {
      return map(entry, (item) => {
        const currDupIdValToken = item.attribute.syntax.value;
        return {
          issueType: "base",
          kind: "NonUniqueIDIssue",
          message: buildMessage(NON_UNIQUE_ID.msg, index),
          severity: "error",
          offsetRange: {
            start: currDupIdValToken.startOffset,
            end: currDupIdValToken.endOffset,
          },
          identicalIDsRanges: map(
            otherDocsDuplicateIssueRecords[index] ?? [],
            (_) => ({
              range: locationToRange(_.attribute.syntax.value),
              documentPath: _.documentPath,
            })
          ),
        };
      });
    }
  );
  return allIDsIssues;
}

class IdsCollectorVisitor implements XMLAstVisitor {
  public idsToXMLElements: Record<string, IDCollector[]> = Object.create(null);
  private _docPath = "";

  get documentPath() {
    return this._docPath;
  }
  set documentPath(docPath: string) {
    this._docPath = docPath;
  }

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
        this.idsToXMLElements[attrib.value] = [
          {
            // @ts-expect-error - TSC does not understand: `attrib.syntax.value !== undefined` is a type guard
            attribute: attrib,
            documentPath: this.documentPath,
          },
        ];
      } else {
        this.idsToXMLElements[attrib.value].push({
          // @ts-expect-error - TSC does not understand: `attrib.syntax.value !== undefined` is a type guard
          attribute: attrib,
          documentPath: this.documentPath,
        });
      }
    }
  }
}

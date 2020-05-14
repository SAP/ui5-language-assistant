import { clone, flatMap, map, omitBy } from "lodash";
import {
  accept,
  XMLAstVisitor,
  XMLAttribute,
  XMLDocument,
  XMLToken,
} from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { NoneUniqueIDIssue } from "../../../api";

export function validateUniqueID(
  xmlDoc: XMLDocument,
  model: UI5SemanticModel
): NoneUniqueIDIssue[] {
  const idCollector = new IdsCollectorVisitor();
  accept(xmlDoc, idCollector);
  const idsToXMLElements = idCollector.idsToXMLElements;

  const duplicatedIdsRecords = omitBy(idsToXMLElements, (_) => _.length > 1);
  const issues: NoneUniqueIDIssue[] = flatMap(
    duplicatedIdsRecords,
    (currDupAttribsPerID, id) => {
      return map(currDupAttribsPerID, (currDupAttrib, currIdx) => {
        const currDuplicatedIdValToken = currDupAttrib.syntax.value;
        const otherDuplicatedIdsAttribs = clone(currDupAttribsPerID).splice(
          currIdx
        );

        return {
          kind: "NoneUniqueIDIssue",
          message: `None Unique ID value: "${id}" found.`,
          severity: "error",
          offsetRange: {
            start: currDuplicatedIdValToken.startOffset,
            end: currDuplicatedIdValToken.endOffset,
          },
          identicalIDsRanges: map(otherDuplicatedIdsAttribs, (_) => ({
            start: _.syntax.value.startOffset,
            end: _.syntax.value.startOffset,
          })),
        };
      });
    }
  );

  return issues;
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
      // UI5 Elements.
      /^[A-Z]/.test(attrib.parent.name)
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

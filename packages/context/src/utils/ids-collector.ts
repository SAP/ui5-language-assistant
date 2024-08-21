import { XMLAstVisitor, XMLAttribute } from "@xml-tools/ast";
import { URI } from "vscode-uri";
import {
  isPossibleCustomClass,
  locationToRange,
} from "@ui5-language-assistant/logic-utils";
import { ControlIdLocation } from "../types";

export class IdsCollectorVisitor implements XMLAstVisitor {
  private ids: Map<string, ControlIdLocation[]>;
  private uri: string;
  constructor(documentPath: string) {
    this.uri = URI.file(documentPath).toString();
    this.ids = new Map();
  }

  getControlIds(): Map<string, ControlIdLocation[]> {
    return this.ids;
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
      const existing = this.ids.get(attrib.value);
      const offsetRange = {
        start: attrib.syntax.value?.startOffset ?? 0,
        end: attrib.syntax.value?.endOffset ?? 0,
      };
      if (existing) {
        this.ids.set(attrib.value, [
          ...existing,
          {
            range: locationToRange(attrib.syntax.value),
            offsetRange,
            uri: this.uri,
          },
        ]);
      } else {
        this.ids.set(attrib.value, [
          {
            range: locationToRange(attrib.syntax.value),
            offsetRange,
            uri: this.uri,
          },
        ]);
      }
    }
  }
}

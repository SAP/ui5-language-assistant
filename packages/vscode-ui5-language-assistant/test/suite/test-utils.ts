import { promises as fs } from "fs";
import * as vscode from "vscode";
import * as chai from "chai";
import { expect } from "chai";
import deepEqualInAnyOrder from "deep-equal-in-any-order";
import { TextDocument } from "vscode-languageclient";

chai.use(deepEqualInAnyOrder);

export async function setFileTextContents(
  content: string,
  xmlPath: string
): Promise<void> {
  await fs.writeFile(xmlPath, content);
  await sleep(500);
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function expectProblemView(
  docUri: vscode.Uri,
  expectedDiagnostics: vscode.Diagnostic[]
): void {
  const actualDiagnostics = vscode.languages.getDiagnostics(docUri);
  expect(expectedDiagnostics).to.deep.equalInAnyOrder(actualDiagnostics);
}

export function getRanges(xmlSnippet: string): vscode.Range[] {
  const RANGE_START_CHAR = "⭲";
  const RANGE_END_CHAR = "⭰";

  const document = TextDocument.create("uri", "xml", 0, xmlSnippet);
  const ranges: vscode.Range[] = [];
  while (xmlSnippet.indexOf(RANGE_START_CHAR) !== -1) {
    const rangeStartIndex = xmlSnippet.indexOf(RANGE_START_CHAR);
    xmlSnippet = xmlSnippet.replace(RANGE_START_CHAR, "");
    const startPosition = document.positionAt(rangeStartIndex + 1);
    const rangeEndIndex = xmlSnippet.indexOf(RANGE_END_CHAR);
    if (rangeEndIndex === -1) {
      break;
    }

    xmlSnippet = xmlSnippet.replace(RANGE_END_CHAR, "");
    const endPosition = document.positionAt(rangeEndIndex + 1);
    const vscodeRange = new vscode.Range(
      new vscode.Position(startPosition.line, startPosition.character),
      new vscode.Position(endPosition.line, endPosition.character)
    );

    ranges.push(vscodeRange);
  }

  return ranges;
}

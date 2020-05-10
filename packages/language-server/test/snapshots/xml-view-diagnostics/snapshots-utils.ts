import { resolve, sep } from "path";
import { Diagnostic, Range } from "vscode-languageserver-types";
import { TextDocument } from "vscode-languageserver";
import { readJsonSync, readFileSync } from "fs-extra";
import { expect } from "chai";
import { sortBy, forEachRight, map } from "lodash";
import { generateModel } from "@ui5-language-assistant/test-utils";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { getXMLViewDiagnostics } from "../../../src/xml-view-diagnostics";

export const INPUT_FILE_NAME = "input.xml";
export const OUTPUT_LSP_RESPONSE_FILE_NAME = "output-lsp-response.json";

export async function snapshotTestLSPDiagnostic(
  testDir: string
): Promise<void> {
  const diagnosticsSnapshots = readSnapshotDiagnosticsLSPResponse(testDir);
  const newlyComputedDiagnostics = await computeNewDiagnosticLSPResponse(
    testDir
  );
  expect(
    newlyComputedDiagnostics,
    "Snapshot Mismatch in LSP Diagnostics response"
  ).to.deep.equal(diagnosticsSnapshots);

  const newlyCommutedRanges = map(newlyComputedDiagnostics, (_) => _.range);
  const newlyComputedXMLWithMarkedRanges = computeXMLWithMarkedRanges(
    testDir,
    newlyCommutedRanges
  );
  // Note the original `input.xml` snippet acts as **both**:
  //   - The sample input.
  //   - A snapshot for marker ranges.
  const originalXMLSnippet = readInputXMLSnippet(testDir, false);
  expect(
    originalXMLSnippet,
    "The XML input snippet range markers are incorrect"
  ).to.equal(newlyComputedXMLWithMarkedRanges);
}

export function readSnapshotDiagnosticsLSPResponse(
  testDir: string
): Diagnostic[] {
  const sourcesTestDir = toSourcesTestDir(testDir);
  const lspResponsePath = resolve(
    sourcesTestDir,
    OUTPUT_LSP_RESPONSE_FILE_NAME
  );
  const expectedDiagnostics = readJsonSync(lspResponsePath);
  return expectedDiagnostics;
}

const ui5ModelPromise = generateModel({ version: "1.71.14" });
let ui5Model: UI5SemanticModel | undefined = undefined;

export async function computeNewDiagnosticLSPResponse(
  testDir: string
): Promise<Diagnostic[]> {
  // No top level await
  ui5Model = await ui5ModelPromise;

  const xmlTextSnippet = readInputXMLSnippet(testDir);
  const xmlTextDoc = TextDocument.create(
    `file://${getInputXMLSnippetPath(testDir)}`,
    "xml",
    0,
    xmlTextSnippet
  );

  const actualDiagnostics = getXMLViewDiagnostics({
    document: xmlTextDoc,
    ui5Model,
  });

  return actualDiagnostics;
}

export function computeXMLWithMarkedRanges(
  testDir: string,
  ranges: Range[]
): string {
  const xmlTextSnippet = readInputXMLSnippet(testDir);
  const xmlTextDoc = TextDocument.create(
    `file://${getInputXMLSnippetPath(testDir)}`,
    "xml",
    0,
    xmlTextSnippet
  );

  // this assumes no overlapping ranges
  const issueRangesByOffsetAscending = sortBy(
    ranges,
    // sort by line first and column second
    (_) => xmlTextDoc.offsetAt(_.start)
  );

  // Changes are made from the "end" of the text to the start to ensure correctness
  let xmlSnippetWithRangeMarkers = xmlTextSnippet;
  forEachRight(issueRangesByOffsetAscending, (_) => {
    const startOffset = xmlTextDoc.offsetAt(_.start);
    const endOffset = xmlTextDoc.offsetAt(_.end);
    const prefix = xmlSnippetWithRangeMarkers.substring(0, startOffset);
    const toBeMarked = xmlTextSnippet.substring(startOffset, endOffset);
    const suffix = xmlTextSnippet.substring(endOffset);
    xmlSnippetWithRangeMarkers = prefix + "🢂" + toBeMarked + "🢀" + suffix;
  });

  return xmlSnippetWithRangeMarkers;
}

export function getInputXMLSnippetPath(testDir: string): string {
  const sourcesTestDir = toSourcesTestDir(testDir);
  const inputXMLSnippetPath = resolve(sourcesTestDir, INPUT_FILE_NAME);
  return inputXMLSnippetPath;
}

function readInputXMLSnippet(
  testDir: string,
  removeRangeMarkers = true
): string {
  const inputPath = getInputXMLSnippetPath(testDir);
  const xmlOriginalContent = readFileSync(inputPath).toString("utf-8");
  if (removeRangeMarkers) {
    const xmlTextSnippetWithoutMarkers = stripRangeMarkers(xmlOriginalContent);
    return xmlTextSnippetWithoutMarkers;
  }
  return xmlOriginalContent;
}

function toSourcesTestDir(libTestDir: string): string {
  // replace TypeScript output dir (lib) with the corresponding sources (test) dir.
  return libTestDir.replace(sep + "lib", "");
}

function stripRangeMarkers(text: string): string {
  return text.replace(/[🢂🢀]/gu, "");
}

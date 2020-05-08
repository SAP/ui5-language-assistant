import { resolve, sep } from "path";
import { Diagnostic } from "vscode-languageserver-types";
import { TextDocument } from "vscode-languageserver";
import { readJsonSync, readFileSync } from "fs-extra";
import { expect } from "chai";
import { sortBy, forEachRight } from "lodash";
import { generateModel } from "@ui5-language-assistant/test-utils";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { getXMLViewDiagnostics } from "../../../src/xml-view-diagnostics";

export const INPUT_FILE_NAME = "input.xml";
export const OUTPUT_LSP_RESPONSE_FILE_NAME = "output-lsp-response.json";
export const OUTPUT_RANGES_FILE_NAME = "output-ranges.xml";

export function getExpectedDiagnosticsLSPResponse(
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

export async function getActualDiagnosticLSPResponse(
  testDir: string
): Promise<Diagnostic[]> {
  // No top level await
  ui5Model = await ui5ModelPromise;
  const sourcesTestDir = toSourcesTestDir(testDir);
  const inputPath = resolve(sourcesTestDir, INPUT_FILE_NAME);
  const xmlSnippetContents = readFileSync(inputPath).toString("utf-8");
  const xmlTextDoc = TextDocument.create(
    `file://${inputPath}`,
    "xml",
    0,
    xmlSnippetContents
  );
  const actualDiagnostics = getXMLViewDiagnostics({
    document: xmlTextDoc,
    ui5Model,
  });
  return actualDiagnostics;
}

export async function getActualXMLWithRIssueRangesMarked(
  testDir: string
): Promise<string> {
  const sourcesTestDir = toSourcesTestDir(testDir);
  const inputPath = resolve(sourcesTestDir, INPUT_FILE_NAME);
  const xmlSnippetContents = readFileSync(inputPath).toString("utf-8");

  const xmlTextDoc = TextDocument.create(
    `file://${inputPath}`,
    "xml",
    0,
    xmlSnippetContents
  );

  const actualDiagnostics = await getActualDiagnosticLSPResponse(testDir);
  // this assumes no overlapping ranges
  const diagnosticsByOffsetAscending = sortBy(
    actualDiagnostics,
    // sort by line first and column second
    (_) => xmlTextDoc.offsetAt(_.range.start)
  );

  // Changes are made from the "end" of the text to the start to ensure correctness
  let xmlSnippetWithRangeMarkers = xmlSnippetContents;
  forEachRight(diagnosticsByOffsetAscending, (_) => {
    const startOffset = xmlTextDoc.offsetAt(_.range.start);
    const endOffset = xmlTextDoc.offsetAt(_.range.end);
    const prefix = xmlSnippetWithRangeMarkers.substring(0, startOffset);
    const toBeMarked = xmlSnippetContents.substring(startOffset, endOffset);
    const suffix = xmlSnippetContents.substring(endOffset);

    xmlSnippetWithRangeMarkers = prefix + "🢂" + toBeMarked + "🢀" + suffix;
  });

  return xmlSnippetWithRangeMarkers;
}

export function getExpectedXMLWithRIssueRangesMarked(testDir: string): string {
  const sourcesTestDir = toSourcesTestDir(testDir);
  const lspResponsePath = resolve(sourcesTestDir, OUTPUT_RANGES_FILE_NAME);
  const expectedMarkedRanges = readFileSync(lspResponsePath).toString("utf-8");
  return expectedMarkedRanges;
}

export async function snapshotTestLSPDiagnostic(
  testDir: string
): Promise<void> {
  const expected = getExpectedDiagnosticsLSPResponse(testDir);
  const actual = await getActualDiagnosticLSPResponse(testDir);
  expect(actual).to.deep.equal(expected);
}

function toSourcesTestDir(libTestDir: string): string {
  // replace TypeScript output dir (lib) with the corresponding sources (test) dir.
  return libTestDir.replace(sep + "lib", "");
}

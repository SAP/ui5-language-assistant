import { resolve, sep, relative, dirname, basename } from "path";
import { Diagnostic, Range } from "vscode-languageserver-types";
import { TextDocument } from "vscode-languageserver";
import { readJsonSync, readFileSync } from "fs-extra";
import { expect } from "chai";
import { sortBy, forEachRight, map, cloneDeep, forEach } from "lodash";
import {
  generateModel,
  getFallbackPatchVersions,
} from "@ui5-language-assistant/test-utils";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  DEFAULT_UI5_VERSION,
  DEFAULT_UI5_FRAMEWORK,
} from "@ui5-language-assistant/constant";
import { generate } from "@ui5-language-assistant/semantic-model";
import {
  getXMLViewDiagnostics,
  getXMLViewIdDiagnostics,
} from "../../../../src/xml-view-diagnostics";
import { Context as AppContext } from "@ui5-language-assistant/context";
import { getDefaultContext } from "../../completion-items-utils";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";

export const INPUT_FILE_NAME = "input.xml";
export const OUTPUT_LSP_RESPONSE_FILE_NAME = "output-lsp-response.json";
export type LSPDiagnosticOptions = {
  flexEnabled: boolean;
  controlIds: Map<string, []>;
};

export async function snapshotTestLSPDiagnostic(
  testDir: string,
  options: LSPDiagnosticOptions
): Promise<void> {
  const pkgJsonPath = require.resolve(
    "@ui5-language-assistant/language-server/package.json"
  );
  const languageServerDir = dirname(pkgJsonPath);
  // This is the project root directory
  const rootDir = resolve(languageServerDir, "..", "..");

  // Note: the original `input.xml` snippet acts as **both**:
  //   - The sample input.
  //   - A snapshot for marker ranges.
  const originalXMLSnippet = readInputXMLSnippet(testDir, false);
  const diagnosticsSnapshots = readSnapshotDiagnosticsLSPResponse(testDir);

  // Check consistency of the ranges between the input xml and the snapshot response
  // (for example, if one of them was changed manually)
  const snapshotRanges = map(diagnosticsSnapshots, (_) => _.range);
  const snapshotXMLWithMarkedRanges = computeXMLWithMarkedRanges(
    testDir,
    snapshotRanges
  );

  expect(
    originalXMLSnippet,
    `The XML input snippet range markers don't match the snapshot response ranges. Did you forget to run "yarn update-snapshots"?
     Input xml is at: ${relative(rootDir, getInputXMLSnippetPath(testDir))}
     Snapshot response is at: ${relative(
       rootDir,
       getSnapshotDiagnosticsLSPResponsePath(testDir)
     )}`
  ).to.equal(snapshotXMLWithMarkedRanges);

  const newlyComputedDiagnostics = await computeNewDiagnosticLSPResponse(
    testDir,
    options
  );
  expect(
    newlyComputedDiagnostics,
    `Snapshot Mismatch in LSP Diagnostics response. 
     Snapshot is at: ${relative(
       rootDir,
       getSnapshotDiagnosticsLSPResponsePath(testDir)
     )}`
  ).to.deep.equal(diagnosticsSnapshots);

  const newlyCommutedRanges = map(newlyComputedDiagnostics, (_) => _.range);
  const newlyComputedXMLWithMarkedRanges = computeXMLWithMarkedRanges(
    testDir,
    newlyCommutedRanges
  );

  expect(
    originalXMLSnippet,
    `The XML input snippet range markers are incorrect. 
     Snapshot is at: ${relative(rootDir, getInputXMLSnippetPath(testDir))}`
  ).to.equal(newlyComputedXMLWithMarkedRanges);
}

export function getSnapshotDiagnosticsLSPResponsePath(
  sourcesTestDir: string
): string {
  const snapshotResponsePath = resolve(
    sourcesTestDir,
    OUTPUT_LSP_RESPONSE_FILE_NAME
  );
  return snapshotResponsePath;
}

export function readSnapshotDiagnosticsLSPResponse(
  sourcesTestDir: string
): Diagnostic[] {
  const lspResponsePath = getSnapshotDiagnosticsLSPResponsePath(sourcesTestDir);
  const expectedDiagnostics = readJsonSync(lspResponsePath);
  return expectedDiagnostics;
}

const ui5ModelPromise = new Promise<UI5SemanticModel>((done, reject) => {
  getFallbackPatchVersions()
    .then((patch) => {
      generateModel({
        framework: DEFAULT_UI5_FRAMEWORK,
        version: patch.SAPUI5 as typeof DEFAULT_UI5_VERSION,
        modelGenerator: generate,
      })
        .then((model) => done(model))
        .catch((e) => reject(e));
    })
    .catch((e) => reject(e));
});

let ui5Model: UI5SemanticModel | undefined = undefined;
let appContext: AppContext;

export async function computeNewDiagnosticLSPResponse(
  testDir: string,
  options: LSPDiagnosticOptions
): Promise<Diagnostic[]> {
  const xmlTextSnippet = readInputXMLSnippet(testDir);
  const viewFiles = {};
  const { cst, tokenVector } = parse(xmlTextSnippet);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  viewFiles[""] = ast;
  // No top level await
  ui5Model = await ui5ModelPromise;
  appContext = {
    ...getDefaultContext(ui5Model),
    manifestDetails: {
      appId: "",
      manifestPath: "",
      flexEnabled: options ? options.flexEnabled : false,
      customViews: {},
      mainServicePath: undefined,
      minUI5Version: undefined,
    },
    viewFiles,
    controlIds: options?.controlIds ? options.controlIds : new Map(),
  };
  const xmlTextDoc = TextDocument.create(
    `file://${getInputXMLSnippetPath(testDir)}`,
    "xml",
    0,
    xmlTextSnippet
  );
  const dirName = basename(testDir);
  const actualDiagnostics =
    dirName === "non-unique-id"
      ? getXMLViewIdDiagnostics({ document: xmlTextDoc, context: appContext })
      : getXMLViewDiagnostics({
          document: xmlTextDoc,
          context: appContext,
        });

  const diagnosticsForAssertions =
    cleanupLSPResponseForAssertions(actualDiagnostics);
  return diagnosticsForAssertions;
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
    const toBeMarked = xmlSnippetWithRangeMarkers.substring(
      startOffset,
      endOffset
    );
    const suffix = xmlSnippetWithRangeMarkers.substring(endOffset);
    xmlSnippetWithRangeMarkers = prefix + "🢂" + toBeMarked + "🢀" + suffix;
  });

  return xmlSnippetWithRangeMarkers;
}

export function getInputXMLSnippetPath(sourcesTestDir: string): string {
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

export function toSourcesTestDir(libTestDir: string): string {
  // replace TypeScript output dir (lib) with the corresponding sources (test) dir.
  return libTestDir.replace(sep + "lib", "");
}

function stripRangeMarkers(text: string): string {
  return text.replace(/[🢂🢀]/gu, "");
}

function cleanupLSPResponseForAssertions(
  diagnostics: Diagnostic[]
): Diagnostic[] {
  // side effect free
  const clonedDiagnostics = cloneDeep(diagnostics);
  forEach(clonedDiagnostics, (_) => {
    // Platform / Machine indepednet "formatting" for the related information uri.
    // e.g: avoid `/` vs `\` or absolute paths of specific users file system structure.
    forEach(_.relatedInformation, (info) => {
      const uriSuffixMatch = /.+(snapshots.*)$/.exec(info.location.uri);
      if (uriSuffixMatch === null) {
        throw Error(
          "Failure computing a relatedInformation URI for snapshots!"
        );
      }
      const uriSuffixWithForwardSlash = uriSuffixMatch[1].replace(/\\/g, "/");
      info.location.uri = uriSuffixWithForwardSlash;
    });
    return _;
  });

  return clonedDiagnostics;
}

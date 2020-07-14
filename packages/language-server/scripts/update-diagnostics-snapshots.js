/* istanbul ignore file - dev scripts don't need tests */
const klawSync = require("klaw-sync");
const { forEach, filter, map } = require("lodash");
const { resolve, dirname } = require("path");
const { writeFileSync, existsSync } = require("fs");
const { format } = require("prettier");

const {
  computeXMLWithMarkedRanges,
  computeNewDiagnosticLSPResponse,
  INPUT_FILE_NAME,
  OUTPUT_LSP_RESPONSE_FILE_NAME,
  getInputXMLSnippetPath,
} = require("../lib/test/snapshots/xml-view-diagnostics/snapshots-utils");

const diagnosticsDir = resolve(
  __dirname,
  "..",
  "test",
  "snapshots",
  "xml-view-diagnostics"
);
const sampleFiles = klawSync(diagnosticsDir, { nodir: true });
const xmlSampleFiles = filter(sampleFiles, (fileDesc) => {
  return fileDesc.path.endsWith(INPUT_FILE_NAME);
});

forEach(xmlSampleFiles, async (xmlSample) => {
  console.log(`Reading <${xmlSample.path}>`);
  const specDirPath = dirname(xmlSample.path);
  const optionsPath = resolve(specDirPath, "options.js");
  let options;
  if (existsSync(optionsPath)) {
    options = require(optionsPath);
  } else {
    options = { flexEnabled: false };
  }

  const newlyComputedResponse = await computeNewDiagnosticLSPResponse(
    specDirPath,
    options
  );
  const newlyComputedResponseText = JSON.stringify(newlyComputedResponse);
  const newlyComputedResponseTextFormatted = format(newlyComputedResponseText, {
    parser: "json",
  });
  const snapshotResponseFilePath = resolve(
    specDirPath,
    OUTPUT_LSP_RESPONSE_FILE_NAME
  );
  console.log(`writing <${snapshotResponseFilePath}>`);
  writeFileSync(snapshotResponseFilePath, newlyComputedResponseTextFormatted);

  const newlyComputedRanges = map(newlyComputedResponse, (_) => _.range);
  const newlyComputedXMLWithMarkers = await computeXMLWithMarkedRanges(
    specDirPath,
    newlyComputedRanges
  );
  const inputSnippetPath = getInputXMLSnippetPath(specDirPath);
  console.log(`writing <${inputSnippetPath}>`);

  // We are adding the the markers on the original input
  // This is used to easily visually indicate where we expect the diagnostics
  // to occur in the sample document.
  writeFileSync(inputSnippetPath, newlyComputedXMLWithMarkers);
});

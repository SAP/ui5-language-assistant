/* istanbul ignore file - dev scripts don't need tests */
const klawSync = require("klaw-sync");
const { forEach, filter, map } = require("lodash");
const { resolve, dirname } = require("path");
const { writeFileSync } = require("fs");
const { format } = require("prettier");

const {
  getExpectedXMLWithRIssueRangesMarked,
  getActualDiagnosticLSPResponse,
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

  const actualResponse = await getActualDiagnosticLSPResponse(specDirPath);
  const actualResponseText = JSON.stringify(actualResponse);
  const formattedResponseText = format(actualResponseText, { parser: "json" });
  const outputResponseFilePath = resolve(
    specDirPath,
    OUTPUT_LSP_RESPONSE_FILE_NAME
  );
  console.log(`writing <${outputResponseFilePath}>`);
  writeFileSync(outputResponseFilePath, formattedResponseText);

  const actualRanges = map(actualResponse, (_) => _.range);
  const actualRangeMarkersText = await getExpectedXMLWithRIssueRangesMarked(
    specDirPath,
    actualRanges
  );
  const inputSnippetPath = getInputXMLSnippetPath(specDirPath);
  console.log(`writing <${inputSnippetPath}>`);
  writeFileSync(inputSnippetPath, actualRangeMarkersText);
});

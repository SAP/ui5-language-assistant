/* istanbul ignore file - dev scripts don't need tests */
const klawSync = require("klaw-sync");
const { forEach, filter } = require("lodash");
const { resolve, dirname } = require("path");
const { writeFileSync } = require("fs");
const { format } = require("prettier");

const {
  getActualXMLWithRIssueRangesMarked,
  getActualDiagnosticLSPResponse,
  INPUT_FILE_NAME,
  OUTPUT_RANGES_FILE_NAME,
  OUTPUT_LSP_RESPONSE_FILE_NAME,
} = require("../lib/test/snapshots/xml-view-diagnostics/utils");

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
  const specDirName = dirname(xmlSample.path);

  const actualResponse = await getActualDiagnosticLSPResponse(specDirName);
  const actualResponseText = JSON.stringify(actualResponse);
  const formattedResponseText = format(actualResponseText, { parser: "json" });
  const outputResponseFilePath = resolve(
    specDirName,
    OUTPUT_LSP_RESPONSE_FILE_NAME
  );
  console.log(`writing <${outputResponseFilePath}>`);
  writeFileSync(outputResponseFilePath, formattedResponseText);

  const actualRangeMarkersText = await getActualXMLWithRIssueRangesMarked(
    specDirName
  );
  const outputMarkersFilePath = resolve(specDirName, OUTPUT_RANGES_FILE_NAME);
  console.log(`writing <${outputMarkersFilePath}>`);
  writeFileSync(outputMarkersFilePath, actualRangeMarkersText);
});

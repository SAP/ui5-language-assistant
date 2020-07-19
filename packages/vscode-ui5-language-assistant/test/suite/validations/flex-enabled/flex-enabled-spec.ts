import * as vscode from "vscode";
import { resolve, dirname } from "path";
import { deactivate } from "../../../../src/extension";
import {
  setXMLContent,
  testDiagnostics,
  sleep,
  getRanges,
} from "../../test-utils";

const UI5LANG_ERROR_MSG = "UI5 Language Assistant";
const pkgJsonPath = require.resolve(
  "vscode-ui5-language-assistant/package.json"
);

const rootPkgFolder = dirname(pkgJsonPath);
const testFixtureValidationsFolder = resolve(
  rootPkgFolder,
  "test",
  "test-fixtures",
  "validations"
);

describe("the Language Server Client Validations Integration Tests - Flex Enabled", () => {
  const testFolderPath = resolve(
    testFixtureValidationsFolder,
    "flex-enabled-spec"
  );

  const testFolderUri = vscode.Uri.file(testFolderPath);
  const xmlPath = resolve(testFolderPath, "test.view.xml");
  const xmlUri = vscode.Uri.file(xmlPath);
  const manifestPath = resolve(testFolderPath, "manifest.json");
  const manifestUri = vscode.Uri.file(manifestPath);

  before(async () => {
    await vscode.commands.executeCommand("vscode.openFolder", testFolderUri);
    await vscode.window.showTextDocument(xmlUri);
    await vscode.workspace.openTextDocument(manifestUri);
    // Explicitly wait for extension to load
    await sleep(1000);
  });

  after(async () => {
    await setXMLContent("", xmlPath);
    await deactivate();
  });

  it("will detect missing stable id in non-whitelisted UI5 class", async () => {
    const xmlSnippet = `
        <mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
                <⭲m:Panel⭰>
                </m:Panel>
        </mvc:View>`;
    await setXMLContent(xmlSnippet, xmlPath);
    testDiagnostics(xmlUri, [
      {
        severity: vscode.DiagnosticSeverity.Error,
        message: getNonStableIdErrorMessage("Panel"),
        range: getRanges(xmlSnippet)[0],
        source: UI5LANG_ERROR_MSG,
      },
    ]);
  });

  it("will detect missing stable in sub element when the parent element has attribute sap.ui.dt:designtime='not-adaptable'", async () => {
    const xmlSnippet = `
        <mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons"
            xmlns:sap.ui.dt="sap.ui.dt">
                <m:Panel sap.ui.dt:designtime="not-adaptable">
                    <⭲m:Button⭰></m:Button>
                </m:Panel>
        </mvc:View>`;
    await setXMLContent(xmlSnippet, xmlPath);
    testDiagnostics(xmlUri, [
      {
        severity: vscode.DiagnosticSeverity.Error,
        message: getNonStableIdErrorMessage("Button"),
        range: getRanges(xmlSnippet)[0],
        source: UI5LANG_ERROR_MSG,
      },
    ]);
  });

  it("will detect missing stable id when there is empty id attribute value", async () => {
    const xmlSnippet = `
        <mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
                <⭲m:Panel⭰ id="">
                </m:Panel>
        </mvc:View>`;
    await setXMLContent(xmlSnippet, xmlPath);
    testDiagnostics(xmlUri, [
      {
        severity: vscode.DiagnosticSeverity.Error,
        message: getNonStableIdErrorMessage("Panel"),
        range: getRanges(xmlSnippet)[0],
        source: UI5LANG_ERROR_MSG,
      },
    ]);
  });
});

function getNonStableIdErrorMessage(tag: string): string {
  const errorMessage = `The class "${tag}" must declare a non-empty ID attribute when flexEnabled is "true"`;

  return errorMessage;
}

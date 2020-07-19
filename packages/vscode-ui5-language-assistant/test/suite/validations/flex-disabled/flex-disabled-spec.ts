import * as vscode from "vscode";
import { resolve, dirname } from "path";
import { deactivate } from "../../../../src/extension";
import { setXMLContent, testDiagnostics, sleep } from "../../test-utils";

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

describe("the Language Server Client Validations Integration Tests - Flex Disabled", () => {
  const testFolderPath = resolve(
    testFixtureValidationsFolder,
    "flex-disabled-spec"
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

  it("will not detect missing stable id in non-whitelisted UI5 class", async () => {
    const xmlSnippet = `
        <mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
                <m:Panel>
                </m:Panel>
        </mvc:View>`;
    await setXMLContent(xmlSnippet, xmlPath);
    testDiagnostics(xmlUri, []);
  });
});

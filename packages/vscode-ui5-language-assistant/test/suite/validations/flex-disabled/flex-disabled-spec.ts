import * as vscode from "vscode";
import { resolve } from "path";
import {
  setFileTextContents,
  expectProblemView,
  sleep,
} from "../../test-utils";

const EXTENSION_START_TIMEOUT = 5000;

describe("the Language Server Client Validations Integration Tests - Flex Disabled", () => {
  const scenarioPath = resolve(
    "test",
    "test-fixtures",
    "validations",
    "flex-disabled-spec"
  );

  const testFolderUri = vscode.Uri.file(scenarioPath);
  const xmlPath = resolve(scenarioPath, "test.view.xml");
  const xmlUri = vscode.Uri.file(xmlPath);
  const manifestPath = resolve(scenarioPath, "manifest.json");
  const manifestUri = vscode.Uri.file(manifestPath);

  before(async () => {
    await vscode.commands.executeCommand("vscode.openFolder", testFolderUri);
    await vscode.window.showTextDocument(xmlUri);
    await vscode.workspace.openTextDocument(manifestUri);
    // Explicitly wait for extension to load
    await sleep(EXTENSION_START_TIMEOUT);
  });

  after(async () => {
    await setFileTextContents("", xmlPath);
  });

  it("will not detect missing stable id in non-whitelisted UI5 class", async () => {
    const xmlSnippet = `
        <mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
                <m:Panel>
                </m:Panel>
        </mvc:View>`;
    await setFileTextContents(xmlSnippet, xmlPath);
    expectProblemView(xmlUri, []);
  });
});

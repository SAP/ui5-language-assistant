import * as vscode from "vscode";
import { resolve } from "path";
import {
  getMessage,
  NON_STABLE_ID,
} from "@ui5-language-assistant/xml-views-validation/lib/src/utils/messages";
import {
  setFileTextContents,
  expectProblemView,
  sleep,
  getRanges,
  rootPkgFolder,
} from "../../test-utils";

const EXTENSION_START_TIMEOUT = 5000;
const UI5LANG_ERROR_MSG = "UI5 Language Assistant";

describe("the Language Server Client Validations Integration Tests - Flex Enabled", () => {
  const scenarioPath = resolve(
    rootPkgFolder,
    "test",
    "test-fixtures",
    "validations",
    "flex-enabled-spec"
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

  it("will detect missing stable id in non-whitelisted UI5 class", async () => {
    const xmlSnippet = `
        <mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
                <⭲m:Panel⭰>
                </m:Panel>
        </mvc:View>`;
    await setFileTextContents(xmlSnippet, xmlPath);
    expectProblemView(xmlUri, [
      {
        severity: vscode.DiagnosticSeverity.Error,
        message: getMessage(NON_STABLE_ID, "Panel"),
        range: getRanges(xmlSnippet)[0],
        source: UI5LANG_ERROR_MSG,
        code: 1000,
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
    await setFileTextContents(xmlSnippet, xmlPath);
    expectProblemView(xmlUri, [
      {
        severity: vscode.DiagnosticSeverity.Error,
        message: getMessage(NON_STABLE_ID, "Button"),
        range: getRanges(xmlSnippet)[0],
        source: UI5LANG_ERROR_MSG,
        code: 1000,
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
    await setFileTextContents(xmlSnippet, xmlPath);
    expectProblemView(xmlUri, [
      {
        severity: vscode.DiagnosticSeverity.Error,
        message: getMessage(NON_STABLE_ID, "Panel"),
        range: getRanges(xmlSnippet)[0],
        source: UI5LANG_ERROR_MSG,
        code: 1000,
      },
    ]);
  });
});

import * as vscode from "vscode";
import { resolve } from "path";
import { expect } from "chai";
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
import { filter } from "lodash";

const EXTENSION_START_TIMEOUT = 5000;
const EXECUTE_COMMAD_TIMEOUT = 500;
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

  context("validations", () => {
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

  context("quick fix", () => {
    afterEach(async () => {
      await vscode.commands.executeCommand(
        "workbench.action.closeActiveEditor"
      );
    });

    it("will quick fix a non-stable id issue", async () => {
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

      const fixes = await vscode.commands.executeCommand<vscode.CodeAction[]>(
        "vscode.executeCodeActionProvider",
        xmlUri,
        getRanges(xmlSnippet)[0],
        vscode.CodeActionKind.QuickFix
      );

      expect(fixes).to.exist;
      //@ts-expect-error - test assumption
      expect(fixes[0].command.title).to.be.equal("Generate ID");
      await vscode.commands.executeCommand(
        //@ts-expect-error - test assumption
        fixes[0].command.command,
        //@ts-expect-error - test assumption
        ...fixes[0].command.arguments
      );

      await sleep(EXECUTE_COMMAD_TIMEOUT);
      expectProblemView(xmlUri, []);
    });

    it("will quick fix multiple non-stable id issues for entire file", async () => {
      const xmlSnippet = `
          <mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.ui.commons">
                  <⭲m:Panel⭰>
                    <m:Button></m:Button>
                  </m:Panel>
                  <m:Panel>
                  </m:Panel>
          </mvc:View>`;
      await setFileTextContents(xmlSnippet, xmlPath);
      const actualDiagnostics = vscode.languages.getDiagnostics(xmlUri);
      const nonStableIdDiagnostics = filter(
        actualDiagnostics,
        (_) => _.code === 1000
      );
      expect(nonStableIdDiagnostics.length).to.be.equal(3);
      const fixes = await vscode.commands.executeCommand<vscode.CodeAction[]>(
        "vscode.executeCodeActionProvider",
        xmlUri,
        getRanges(xmlSnippet)[0],
        vscode.CodeActionKind.QuickFix
      );

      expect(fixes).to.exist;
      //@ts-expect-error - test assumption
      expect(fixes[1].command.title).to.be.equal(
        "Generate IDs for entire file"
      );
      await vscode.commands.executeCommand(
        //@ts-expect-error - test assumption
        fixes[1].command.command,
        //@ts-expect-error - test assumption
        ...fixes[1].command.arguments
      );

      await sleep(EXECUTE_COMMAD_TIMEOUT);
      expectProblemView(xmlUri, []);
    });
  });
});

import { filter } from "lodash";
import * as vscode from "vscode";
import { resolve } from "path";
import { expect } from "chai";

import {
  validations,
  buildMessage,
  commands,
} from "@ui5-language-assistant/user-facing-text";
import {
  setFileTextContents,
  expectProblemView,
  sleep,
  getRanges,
  rootPkgFolder,
} from "../../test-utils";

const { NON_STABLE_ID } = validations;

const EXTENSION_START_TIMEOUT = 5000;
const EXECUTE_COMMAD_TIMEOUT = 500;
const UI5LANG_ERROR_MSG = "UI5 Language Assistant";

describe.skip("the Language Server Client Validations Integration Tests - Flex Enabled", () => {
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

  beforeAll(async () => {
    await vscode.commands.executeCommand("vscode.openFolder", testFolderUri);
    await vscode.window.showTextDocument(xmlUri);
    await vscode.workspace.openTextDocument(manifestUri);
    // Explicitly wait for extension to load
    await sleep(EXTENSION_START_TIMEOUT);
  });

  after(async () => {
    await setFileTextContents("", xmlPath);
  });

  describe("validations", () => {
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
          message: buildMessage(NON_STABLE_ID.msg, "Panel"),
          range: getRanges(xmlSnippet)[0],
          source: UI5LANG_ERROR_MSG,
          code: NON_STABLE_ID.code,
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
          message: buildMessage(NON_STABLE_ID.msg, "Button"),
          range: getRanges(xmlSnippet)[0],
          source: UI5LANG_ERROR_MSG,
          code: NON_STABLE_ID.code,
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
          message: buildMessage(NON_STABLE_ID.msg, "Panel"),
          range: getRanges(xmlSnippet)[0],
          source: UI5LANG_ERROR_MSG,
          code: NON_STABLE_ID.code,
        },
      ]);
    });
  });

  describe("quick fix", () => {
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
          message: buildMessage(NON_STABLE_ID.msg, "Panel"),
          range: getRanges(xmlSnippet)[0],
          source: UI5LANG_ERROR_MSG,
          code: NON_STABLE_ID.code,
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
      expect(fixes[0].command.title).to.be.equal(
        commands.QUICK_FIX_STABLE_ID_ERROR.title
      );
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
        (_) => _.code === NON_STABLE_ID.code
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
        commands.QUICK_FIX_STABLE_ID_FILE_ERRORS.title
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

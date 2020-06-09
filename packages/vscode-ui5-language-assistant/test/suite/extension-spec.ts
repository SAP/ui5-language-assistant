import * as vscode from "vscode";
import { expect } from "chai";
import { resolve, dirname } from "path";
import { map } from "lodash";
import { promises as fs } from "fs";
import { TextDocument, Position } from "vscode-languageserver";
import { deactivate } from "../../src/extension";

const pkgJsonPath = require.resolve(
  "vscode-ui5-language-assistant/package.json"
);
const rootPkgFolder = dirname(pkgJsonPath);

const docPath = resolve(rootPkgFolder, "test", "testFixture", "test.view.xml");
const docUri = vscode.Uri.file(docPath);

describe("the Language Server Client Integration Tests", () => {
  before(async () => {
    await vscode.workspace.openTextDocument(docUri);
    await vscode.window.showTextDocument(docUri);
    // Explicitly wait for extension to load
    await sleep(1000);
  });

  after(async () => {
    await setContent("");
    await deactivate();
  });

  it("will get completion values for UI5 class", async () => {
    const xmlSnippet = `<GridLi⇶`;
    const completionsList = ["GridList", "GridListItem"];
    await assertCompletions(xmlSnippet, completionsList);
  });

  it("will get completion values for UI5 property", async () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List show⇶`;
    const completionsList = ["showNoData", "showSeparators", "showUnread"];
    await assertCompletions(xmlSnippet, completionsList);
  });

  it("will get completion values for UI5 event", async () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List update⇶`;
    const completionsList = ["updateFinished", "updateStarted"];
    await assertCompletions(xmlSnippet, completionsList);
  });

  it("will get completion values for UI5 association", async () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List aria⇶`;
    const completionsList = ["ariaLabelledBy"];
    await assertCompletions(xmlSnippet, completionsList);
  });

  it("will get completion values for UI5 aggregation", async () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m">
                          <mvc:content> 
                            <List> <te⇶`;
    const completionsList = ["contextMenu", "items", "swipeContent"];
    await assertCompletions(xmlSnippet, completionsList);
  });

  it("will get completion values for UI5 namespace", async () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns:u⇶`;
    const completionsList = [
      "unified",
      "upload",
      "util",
      "uxap",
      "ubc",
      "ui",
      "ui", // This "ui" is in a different parent
      "ui5",
      "ulc",
    ];
    await assertCompletions(xmlSnippet, completionsList);
  });

  it("will get completion values for UI5 namespace value", async () => {
    const xmlSnippet = `<mvc:View
                          xmlns:mvc="sap.ui.core.mvc"
                          xmlns:rowmodes="table⇶">`;
    const completionsList = ["rowmodes"];
    await assertCompletions(xmlSnippet, completionsList);
  });

  it("will get completion values for UI5 enum value", async () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List showSeparators="⇶"`;
    const completionsList = ["All", "Inner", "None"];
    await assertCompletions(xmlSnippet, completionsList);
  });

  async function setContent(content: string): Promise<void> {
    await fs.writeFile(docPath, content);
    await sleep(1000);
  }

  async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function assertCompletions(
    xmlSnippet: string,
    expectedCompletionNames: string[]
  ): Promise<void> {
    const content = xmlSnippet.replace("⇶", "");
    await setContent(content);

    const offset = xmlSnippet.indexOf("⇶");
    const doc = TextDocument.create(docPath, "xml", 0, content);
    const docPos: Position = doc.positionAt(offset);
    const position: vscode.Position = new vscode.Position(
      docPos.line,
      docPos.character
    );
    const completionsList = (await vscode.commands.executeCommand(
      "vscode.executeCompletionItemProvider",
      docUri,
      position
    )) as vscode.CompletionList;

    const completionNames = map(
      completionsList.items,
      (completion) => completion.label
    );
    expect(completionNames).to.include.members(expectedCompletionNames);
  }
});

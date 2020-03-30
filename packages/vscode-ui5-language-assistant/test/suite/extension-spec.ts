import * as vscode from "vscode";
import { expect } from "chai";
import { resolve, dirname } from "path";
import { map } from "lodash";
import { promises as fs } from "fs";
import { TextDocument, Position } from "vscode-languageserver";
import { deactivate } from "../../src/extension";

const pkgJsonPath = require.resolve("ui5-language-support/package.json");
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
    const extensionStatus = await deactivate();
    expect(extensionStatus).to.equal(undefined);
  });

  it("will get completion values for UI5 class", async () => {
    const xmlSnippet = `<GridLi⇶`;
    const completionsList = ["GridList", "GridListItem"];
    await testCompletions(xmlSnippet, completionsList);
  });

  it("will get completion values for UI5 property", async () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List show⇶`;
    const completionsList = ["showNoData", "showSeparators", "showUnread"];
    await testCompletions(xmlSnippet, completionsList);
  });

  it("will get completion values for UI5 event", async () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List update⇶`;
    const completionsList = ["updateFinished", "updateStarted"];
    await testCompletions(xmlSnippet, completionsList);
  });

  it("will get completion values for UI5 association", async () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List aria⇶`;
    const completionsList = ["ariaLabelledBy"];
    await testCompletions(xmlSnippet, completionsList);
  });

  it("will get completion values for UI5 aggregation", async () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m">
                          <content> 
                            <List> <te⇶`;
    const completionsList = ["contextMenu", "items", "swipeContent"];
    await testCompletions(xmlSnippet, completionsList);
  });

  it("will get completion values for UI5 namespace", async () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns:u⇶`;
    const completionsList = ["unified", "upload", "util", "ux3"];
    await testCompletions(xmlSnippet, completionsList);
  });

  it("will get completion values for UI5 enum value", async () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List showSeparators="⇶"`;
    const completionsList = ["All", "Inner", "None"];
    await testCompletions(xmlSnippet, completionsList);
  });

  async function setContent(content: string): Promise<void> {
    await fs.writeFile(docPath, content);
    await sleep(1000);
  }

  async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function testCompletions(
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
      completion => completion.label
    );
    expect(completionNames).to.include.members(expectedCompletionNames);
  }
});

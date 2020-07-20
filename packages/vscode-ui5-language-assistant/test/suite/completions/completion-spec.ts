import * as vscode from "vscode";
import { resolve } from "path";
import { map } from "lodash";
import { expect } from "chai";
import { TextDocument, Position } from "vscode-languageserver";
import { sleep, setFileTextContents, rootPkgFolder } from "../test-utils";

const EXTENSION_START_TIMEOUT = 5000;

const scenarioPath = resolve(
  rootPkgFolder,
  "test",
  "test-fixtures",
  "completions",
  "test.view.xml"
);

const scenarioUri = vscode.Uri.file(scenarioPath);

describe("the Language Server Client Integration Tests", () => {
  before(async () => {
    await vscode.workspace.openTextDocument(scenarioUri);
    await vscode.window.showTextDocument(scenarioUri);
    // Explicitly wait for extension to load
    await sleep(EXTENSION_START_TIMEOUT);
  });

  after(async () => {
    await setFileTextContents("", scenarioPath);
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

  async function assertCompletions(
    xmlSnippet: string,
    expectedCompletionNames: string[]
  ): Promise<void> {
    const content = xmlSnippet.replace("⇶", "");
    await setFileTextContents(content, scenarioPath);

    const offset = xmlSnippet.indexOf("⇶");
    const doc = TextDocument.create(scenarioPath, "xml", 0, content);
    const docPos: Position = doc.positionAt(offset);
    const position: vscode.Position = new vscode.Position(
      docPos.line,
      docPos.character
    );

    const completionsList = (await vscode.commands.executeCommand(
      "vscode.executeCompletionItemProvider",
      scenarioUri,
      position
    )) as vscode.CompletionList;

    const completionNames = map(
      completionsList.items,
      (completion) => completion.label
    );

    expect(completionNames).to.include.members(expectedCompletionNames);
  }
});

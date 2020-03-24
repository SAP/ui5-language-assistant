import { expect } from "chai";
import { map, uniq } from "lodash";
import {
  TextDocument,
  TextDocumentPositionParams,
  Position,
  TextDocumentIdentifier,
  CompletionItemKind,
  CompletionItem
} from "vscode-languageserver";

import { UI5SemanticModel } from "@ui5-editor-tools/semantic-model-types";
import { generateModel } from "@ui5-editor-tools/test-utils";

import { getCompletionItems } from "../src/language-services";
import { UI5_VERSION } from "../src/ui5-model";

const ui5SemanticModel: UI5SemanticModel = generateModel(UI5_VERSION);

describe("the UI5 tools Language Services", () => {
  it("will get completion values for UI5 class", async () => {
    const xmlSnippet = `<GridLi⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => suggestion.label);

    expect(suggestionNames).to.deep.equalInAnyOrder([
      "GridList",
      "GridListItem"
    ]);

    expect(suggestions[0].kind).to.equal(CompletionItemKind.Class);
  });

  it("will get completion values for UI5 property", async () => {
    const xmlSnippet = `<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m"> <List show⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => suggestion.label);

    expect(suggestionNames).to.deep.equalInAnyOrder([
      "showNoData",
      "showSeparators",
      "showUnread"
    ]);

    expect(suggestions[0].kind).to.equal(CompletionItemKind.Property);
  });

  it("will get completion values for UI5 event", async () => {
    const xmlSnippet = `<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m"> <List update⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => suggestion.label);

    expect(suggestionNames).to.deep.equalInAnyOrder([
      "updateFinished",
      "updateStarted"
    ]);

    expect(suggestions[0].kind).to.equal(CompletionItemKind.Event);
  });

  it("will get completion values for UI5 association", async () => {
    const xmlSnippet = `<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m"> <List aria⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => suggestion.label);

    expect(suggestionNames).to.deep.equalInAnyOrder(["ariaLabelledBy"]);

    expect(suggestions[0].kind).to.equal(CompletionItemKind.Text);
  });

  it("will get completion values for UI5 aggregation", async () => {
    const xmlSnippet = `<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m"> <List> <te⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => suggestion.label);

    expect(suggestionNames).to.deep.equalInAnyOrder([
      "contextMenu",
      "items",
      "swipeContent"
    ]);

    expect(suggestions[0].kind).to.equal(CompletionItemKind.Text);
  });

  it("will get completion values for UI5 namespace", async () => {
    const xmlSnippet = `<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:u⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => suggestion.label);

    expect(suggestionNames).to.deep.equalInAnyOrder([
      "unified",
      "upload",
      "util",
      "ux3",
      "uxap"
    ]);

    expect(suggestions[0].kind).to.equal(CompletionItemKind.Text);
  });

  it("will get completion values for UI5 attribute value", async () => {
    const xmlSnippet = `<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m"> <List showSeparators = "⇶"`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => suggestion.label);

    expect(suggestionNames).to.deep.equalInAnyOrder(["All", "Inner", "None"]);

    expect(suggestions[0].kind).to.equal(CompletionItemKind.EnumMember);
  });

  it("will get completion values for UI5 properties, events and associations", async () => {
    const xmlSnippet = `<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m"> <List ⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionKinds).to.deep.equalInAnyOrder([
      CompletionItemKind.Property,
      CompletionItemKind.Event,
      CompletionItemKind.Text
    ]);
  });

  it("will not get completion values for unknown class", async () => {
    const xmlSnippet = `<Unknown⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    expect(suggestions).to.deep.equal([]);
  });
});

function createTextDocument(languageId: string, content: string): TextDocument {
  return TextDocument.create("uri", languageId, 0, content);
}

function getSuggestions(xmlSnippet: string): CompletionItem[] {
  const xmlText = xmlSnippet.replace("⇶", "");
  const doc: TextDocument = createTextDocument("xml", xmlText);
  const pos: Position = getPosition(xmlSnippet);
  const uri: TextDocumentIdentifier = { uri: "uri" };
  const textDocPositionParams: TextDocumentPositionParams = {
    textDocument: uri,
    position: pos
  };

  return getCompletionItems(ui5SemanticModel, textDocPositionParams, doc);
}

function getPosition(xmlSnippet: string): Position {
  return {
    line: 0,
    character: xmlSnippet.indexOf("⇶")
  };
}

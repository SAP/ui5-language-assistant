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

import { getCompletionItems, computeLSPKind } from "../src/completion-items";

const ui5SemanticModel: UI5SemanticModel = generateModel("1.74.0"); //TODO: use 1.71.x

describe("the UI5 tools Language Code Completion Services", () => {
  it("will get completion values for UI5 class", () => {
    const xmlSnippet = `<GridLi⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => suggestion.label);
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      "GridList",
      "GridListItem"
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Class]);
  });

  it("will get completion values for UI5 property", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List show⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => suggestion.label);
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      "showNoData",
      "showSeparators",
      "showUnread"
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Property]);
  });

  it("will get completion values for UI5 event", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List update⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => suggestion.label);
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      "updateFinished",
      "updateStarted"
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Event]);
  });

  it("will get completion values for UI5 association", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List aria⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => suggestion.label);
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder(["ariaLabelledBy"]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Text]);
  });

  it("will get completion values for UI5 aggregation", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List> <te⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => suggestion.label);
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      "contextMenu",
      "items",
      "swipeContent"
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Text]);
  });

  it("will get completion values for UI5 xmlns key namespace", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns:u⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => suggestion.label);
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      "unified",
      "upload",
      "util",
      "ux3",
      "uxap"
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Text]);
  });

  it("will get completion values for UI5 enum value", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List showSeparators="⇶"`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => suggestion.label);
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder(["All", "Inner", "None"]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.EnumMember]);
  });

  it("will not get completion values for unknown class", () => {
    const xmlSnippet = `<Unknown⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    expect(suggestions).to.be.empty;
  });

  it("will get completion values for UI5 properties, events and associations", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List ⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionKinds).to.deep.equal([
      CompletionItemKind.Property,
      CompletionItemKind.Event,
      CompletionItemKind.Text
    ]);
  });

  it("will get the lsp completion item kind according to the suggestion type", () => {
    expectLspKind("UI5NamespacesInXMLAttributeKey", CompletionItemKind.Text);
    expectLspKind("UI5NamespacesInXMLAttributeValue", CompletionItemKind.Text);
    expectLspKind("UI5AggregationsInXMLTagName", CompletionItemKind.Text);
    expectLspKind("UI5PropsInXMLAttributeKey", CompletionItemKind.Property);
    expectLspKind("UI5ClassesInXMLTagName", CompletionItemKind.Class);
    expectLspKind("UI5EventsInXMLAttributeKey", CompletionItemKind.Event);
    expectLspKind("UI5EnumsInXMLAttributeValue", CompletionItemKind.EnumMember);
    expectLspKind("UI5UnknownKey", CompletionItemKind.Text);
  });
});

function expectLspKind(
  suggestionType: string,
  expectedKind: CompletionItemKind
): void {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const suggestion: any = { type: suggestionType };
  const lspKind = computeLSPKind(suggestion);
  expect(lspKind).to.equal(expectedKind);
}

function createTextDocument(languageId: string, content: string): TextDocument {
  return TextDocument.create("uri", languageId, 0, content);
}

function getSuggestions(xmlSnippet: string): CompletionItem[] {
  const xmlText = xmlSnippet.replace("⇶", "");
  const offset = xmlSnippet.indexOf("⇶");
  const doc: TextDocument = createTextDocument("xml", xmlText);
  const pos: Position = doc.positionAt(offset);
  const uri: TextDocumentIdentifier = { uri: "uri" };
  const textDocPositionParams: TextDocumentPositionParams = {
    textDocument: uri,
    position: pos
  };

  return getCompletionItems(ui5SemanticModel, textDocPositionParams, doc);
}

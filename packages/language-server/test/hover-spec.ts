import { expect } from "chai";
import {
  TextDocument,
  Position,
  Hover,
  TextDocumentIdentifier,
  TextDocumentPositionParams,
  MarkupContent,
  MarkedString,
  MarkupKind,
} from "vscode-languageserver";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  generateModel,
  expectExists,
} from "@ui5-language-assistant/test-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import { getHoverResponse } from "../src/hover";

describe("the UI5 language assistant Hover Tooltip Service", () => {
  let ui5SemanticModel: UI5SemanticModel;
  before(async () => {
    ui5SemanticModel = await generateModel({
      framework: "SAPUI5",
      version: "1.71.49",
      modelGenerator: generate,
    });
  });

  context("hover on attribute key", () => {
    it("will get hover content UI5 property", async () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:content>
                              <List showSeparator⇶s="All"></List>
                            </mvc:content>
                          </mvc:View>`;
      const response = await getHoverItem(xmlSnippet, ui5SemanticModel);
      expectExists(response, "Hover item");
      assertMarkup(response.contents);
      expect(response.contents.value).to.include(
        "Defines which item separator style will be used."
      );
    });

    it("will get hover content UI5 association", async () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <Button ariaDesc⇶ribedBy=""></Button>
                          </mvc:View>`;
      const response = await getHoverItem(xmlSnippet, ui5SemanticModel);
      expectExists(response, "Hover item");
      assertMarkup(response.contents);
      expect(response.contents.value).to.include(
        "ids which describe this control"
      );
    });

    it("will get hover content UI5 event", async () => {
      const xmlSnippet = `<mvc:View afte⇶rInit=""
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                          </mvc:View>`;
      const response = await getHoverItem(xmlSnippet, ui5SemanticModel);
      expectExists(response, "Hover item");
      assertMarkup(response.contents);
      expect(response.contents.value).to.include(
        "Fired when the View has parsed the UI description and instantiated the contained controls"
      );
    });

    it("will get hover content UI5 property - incorrect property", async () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:content>
                              <List showSeparator⇶s1="All"></List>
                            </mvc:content>
                          </mvc:View>`;
      const response = await getHoverItem(xmlSnippet, ui5SemanticModel);
      expect(response).to.not.exist;
    });
  });

  context("hover on attribute value", async () => {
    it("will get hover content UI5 enum", async () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:content>
                              <List showSeparators="Al⇶l"></List>
                            </mvc:content>
                          </mvc:View>`;
      const response = await getHoverItem(xmlSnippet, ui5SemanticModel);
      expectExists(response, "Hover item");
      assertMarkup(response.contents);
      expect(response.contents.value).to.include(
        "Separators between the items including the last and the first one."
      );
    });

    it("will get hover content UI5 namespace in xmlns attribute", async () => {
      const xmlSnippet = `<mvc:View
                              xmlns:mvc="sap.ui.core.mvc"
                              xmlns="sap.m⇶"> 
                              <mvc:content>
                                <List showSeparators="All"></List>
                              </mvc:content>
                            </mvc:View>`;
      const response = await getHoverItem(xmlSnippet, ui5SemanticModel);
      expectExists(response, "Hover item");
      assertMarkup(response.contents);
      expect(response.contents.value).to.include(
        "The main UI5 control library, with responsive controls that can be used in touch devices as well as desktop browsers."
      );
    });
  });

  context("hover on element open tag name", () => {
    it("will get hover content UI5 class", async () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:content>
                              <Lis⇶t showSeparators="All"></List>
                            </mvc:content>
                          </mvc:View>`;
      const response = await getHoverItem(xmlSnippet, ui5SemanticModel);
      expectExists(response, "Hover item");
      assertMarkup(response.contents);
      expect(response.contents.value).to.include(
        "The List control provides a container for all types of list items."
      );
    });

    it("will get hover content UI5 Aggregation", async () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:conten⇶t>
                              <List showSeparators="All"></List>
                            </mvc:content>
                          </mvc:View>`;
      const response = await getHoverItem(xmlSnippet, ui5SemanticModel);
      expectExists(response, "Hover item");
      assertMarkup(response.contents);
      expect(response.contents.value).to.include("Child Controls of the view");
    });
  });

  context("hover on element close tag name", () => {
    it("will get hover content UI5 class", async () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:content>
                              <List showSeparators="All"></L⇶ist>
                            </mvc:content>
                          </mvc:View>`;
      const response = await getHoverItem(xmlSnippet, ui5SemanticModel);
      expectExists(response, "Hover item");
      assertMarkup(response.contents);
      expect(response.contents.value).to.include(
        "The List control provides a container for all types of list items."
      );
    });

    it("will get hover content UI5 Aggregation", async () => {
      const xmlSnippet = `<mvc:View
                              xmlns:mvc="sap.ui.core.mvc"
                              xmlns="sap.m"> 
                              <mvc:content>
                                <List showSeparators="All"></List>
                              </mvc:conten⇶t>
                            </mvc:View>`;
      const response = await getHoverItem(xmlSnippet, ui5SemanticModel);
      expectExists(response, "Hover item");
      assertMarkup(response.contents);
      expect(response.contents.value).to.include("Child Controls of the view");
    });
  });

  it("will get hover content - open tag is different from close tag", async () => {
    const xmlSnippet = `<mvc:View
                          xmlns:mvc="sap.ui.core.mvc"
                          xmlns="sap.m"> 
                          <mvc:content></L⇶ist>
                        </mvc:View>`;
    const response = await getHoverItem(xmlSnippet, ui5SemanticModel);
    expectExists(response, "Hover item");
    assertMarkup(response.contents);
    expect(response.contents.value).to.include(
      "The List control provides a container for all types of list items."
    );
  });

  it("will get undefined hover content", async () => {
    const xmlSnippet = `<mvc:View
                          xmlns:mvc="sap.ui.core.mvc"
                          xmlns="sap.m"> 
                          <mvc:content>
                            <List ⇶ showSeparators="All"></List>
                          </mvc:content>
                        </mvc:View>`;
    const response = await getHoverItem(xmlSnippet, ui5SemanticModel);
    expect(response).to.not.exist;
  });
});

export async function getHoverItem(
  xmlSnippet: string,
  ui5SemanticModel: UI5SemanticModel
): Promise<Hover | undefined> {
  const { document, position } = getXmlSnippet(xmlSnippet);
  const uri: TextDocumentIdentifier = { uri: "uri" };
  const textDocPositionParams: TextDocumentPositionParams = {
    textDocument: uri,
    position: position,
  };

  const hoverItem = await getHoverResponse(
    ui5SemanticModel,
    textDocPositionParams,
    document
  );

  return hoverItem;
}

function getXmlSnippet(
  xmlSnippet: string
): { document: TextDocument; position: Position } {
  const xmlText = xmlSnippet.replace("⇶", "");
  const offset = xmlSnippet.indexOf("⇶");
  const document: TextDocument = createTextDocument("xml", xmlText);
  const position: Position = document.positionAt(offset);
  return { document, position };
}

function createTextDocument(languageId: string, content: string): TextDocument {
  return TextDocument.create("uri", languageId, 0, content);
}

function assertMarkup(
  content:
    | string
    | MarkupContent
    | {
        language: string;
        value: string;
      }
    | MarkedString[]
): asserts content is MarkupContent {
  expect(content).to.be.an("object");
  expect((content as MarkupContent).kind).to.equal(MarkupKind.Markdown);
}

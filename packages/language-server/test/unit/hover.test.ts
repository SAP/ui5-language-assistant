import {
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
import { getHoverResponse } from "../../src/hover";
import { Context as AppContext } from "@ui5-language-assistant/context";
import { getDefaultContext } from "./completion-items-utils";
import { xmlSnippetToDocument } from "./testUtils";

describe("the UI5 language assistant Hover Tooltip Service", () => {
  let ui5SemanticModel: UI5SemanticModel;
  let appContext: AppContext;
  beforeAll(async () => {
    ui5SemanticModel = await generateModel({
      framework: "SAPUI5",
      version: "1.71.49",
      modelGenerator: generate,
    });
    appContext = getDefaultContext(ui5SemanticModel);
  });

  describe("hover on attribute key", () => {
    it("will get hover content UI5 property", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:content>
                              <List showSeparator⇶s="All"></List>
                            </mvc:content>
                          </mvc:View>`;
      const response = getHoverItem(xmlSnippet, appContext);
      expectExists(response, "Hover item");
      assertMarkup(response.contents);
      expect(response.contents.value).toInclude(
        "Defines which item separator style will be used."
      );
    });

    it("will get hover content UI5 association", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <Button ariaDesc⇶ribedBy=""></Button>
                          </mvc:View>`;
      const response = getHoverItem(xmlSnippet, appContext);
      expectExists(response, "Hover item");
      assertMarkup(response.contents);
      expect(response.contents.value).toInclude(
        "ids which describe this control"
      );
    });

    it("will get hover content UI5 event", () => {
      const xmlSnippet = `<mvc:View afte⇶rInit=""
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                          </mvc:View>`;
      const response = getHoverItem(xmlSnippet, appContext);
      expectExists(response, "Hover item");
      assertMarkup(response.contents);
      expect(response.contents.value).toInclude(
        "Fired when the View has parsed the UI description and instantiated the contained controls"
      );
    });

    it("will get hover content UI5 property - incorrect property", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:content>
                              <List showSeparator⇶s1="All"></List>
                            </mvc:content>
                          </mvc:View>`;
      const response = getHoverItem(xmlSnippet, appContext);
      expect(response).toBeUndefined();
    });
    it("will get hover content UI5 property - alt types", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:content>
                               <Text text="My Text" tool⇶tip="" />
                            </mvc:content>
                          </mvc:View>`;
      const response = getHoverItem(xmlSnippet, appContext);
      expectExists(response, "Hover item");
      assertMarkup(response.contents);
      expect(response.contents.value).toInclude("Alternative types: String");
    });
  });

  describe("hover on attribute value", () => {
    it("will get hover content UI5 enum", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:content>
                              <List showSeparators="Al⇶l"></List>
                            </mvc:content>
                          </mvc:View>`;
      const response = getHoverItem(xmlSnippet, appContext);
      expectExists(response, "Hover item");
      assertMarkup(response.contents);
      expect(response.contents.value).toInclude(
        "Separators between the items including the last and the first one."
      );
    });

    it("will get hover content UI5 namespace in xmlns attribute", () => {
      const xmlSnippet = `<mvc:View
                              xmlns:mvc="sap.ui.core.mvc"
                              xmlns="sap.m⇶"> 
                              <mvc:content>
                                <List showSeparators="All"></List>
                              </mvc:content>
                            </mvc:View>`;
      const response = getHoverItem(xmlSnippet, appContext);
      expectExists(response, "Hover item");
      assertMarkup(response.contents);
      expect(response.contents.value).toInclude(
        "The main UI5 control library, with responsive controls that can be used in touch devices as well as desktop browsers."
      );
    });
  });

  describe("hover on element open tag name", () => {
    it("will get hover content UI5 class", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:content>
                              <Lis⇶t showSeparators="All"></List>
                            </mvc:content>
                          </mvc:View>`;
      const response = getHoverItem(xmlSnippet, appContext);
      expectExists(response, "Hover item");
      assertMarkup(response.contents);
      expect(response.contents.value).toInclude(
        "The List control provides a container for all types of list items."
      );
    });

    it("will get hover content UI5 Aggregation", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:conten⇶t>
                              <List showSeparators="All"></List>
                            </mvc:content>
                          </mvc:View>`;
      const response = getHoverItem(xmlSnippet, appContext);
      expectExists(response, "Hover item");
      assertMarkup(response.contents);
      expect(response.contents.value).toInclude("Child Controls of the view");
    });
  });

  describe("hover on element close tag name", () => {
    it("will get hover content UI5 class", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:content>
                              <List showSeparators="All"></L⇶ist>
                            </mvc:content>
                          </mvc:View>`;
      const response = getHoverItem(xmlSnippet, appContext);
      expectExists(response, "Hover item");
      assertMarkup(response.contents);
      expect(response.contents.value).toInclude(
        "The List control provides a container for all types of list items."
      );
    });

    it("will get hover content UI5 Aggregation", () => {
      const xmlSnippet = `<mvc:View
                              xmlns:mvc="sap.ui.core.mvc"
                              xmlns="sap.m"> 
                              <mvc:content>
                                <List showSeparators="All"></List>
                              </mvc:conten⇶t>
                            </mvc:View>`;
      const response = getHoverItem(xmlSnippet, appContext);
      expectExists(response, "Hover item");
      assertMarkup(response.contents);
      expect(response.contents.value).toInclude("Child Controls of the view");
    });
  });

  it("will get hover content - open tag is different from close tag", () => {
    const xmlSnippet = `<mvc:View
                          xmlns:mvc="sap.ui.core.mvc"
                          xmlns="sap.m"> 
                          <mvc:content></L⇶ist>
                        </mvc:View>`;
    const response = getHoverItem(xmlSnippet, appContext);
    expectExists(response, "Hover item");
    assertMarkup(response.contents);
    expect(response.contents.value).toInclude(
      "The List control provides a container for all types of list items."
    );
  });

  it("will get undefined hover content", () => {
    const xmlSnippet = `<mvc:View
                          xmlns:mvc="sap.ui.core.mvc"
                          xmlns="sap.m"> 
                          <mvc:content>
                            <List ⇶ showSeparators="All"></List>
                          </mvc:content>
                        </mvc:View>`;
    const response = getHoverItem(xmlSnippet, appContext);
    expect(response).toBeUndefined();
  });
});

export function getHoverItem(
  xmlSnippet: string,
  context: AppContext
): Hover | undefined {
  const { document, position } = xmlSnippetToDocument(xmlSnippet);
  const uri: TextDocumentIdentifier = { uri: "uri" };
  const textDocPositionParams: TextDocumentPositionParams = {
    textDocument: uri,
    position: position,
  };

  return getHoverResponse(context, textDocPositionParams, document);
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
  expect(content).toBeObject();
  expect((content as MarkupContent).kind).toEqual(MarkupKind.Markdown);
}

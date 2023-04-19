import { expect } from "chai";
import { TextDocument, Position } from "vscode-languageserver";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { astPositionAtOffset } from "@xml-tools/ast-position";
import { buildAst } from "@xml-tools/ast";
import {
  UI5SemanticModel,
  BaseUI5Node,
} from "@ui5-language-assistant/semantic-model-types";
import { generate } from "@ui5-language-assistant/semantic-model";
import {
  generateModel,
  expectExists,
} from "@ui5-language-assistant/test-utils";
import { findUI5HoverNodeAtOffset } from "../src/tooltip";
import { Context as AppContext } from "@ui5-language-assistant/context";
import { getDefaultContext } from "./utils";

describe("the UI5 language assistant Hover Tooltip Service", () => {
  let ui5SemanticModel: UI5SemanticModel;
  let appContext: AppContext;
  before(async () => {
    ui5SemanticModel = await generateModel({
      framework: "SAPUI5",
      version: "1.71.49",
      modelGenerator: generate,
    });
    appContext = getDefaultContext(ui5SemanticModel);
  });

  context("hover on attribute key", () => {
    it("will get hover content UI5 property", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:content>
                              <List showSeparator⇶s="All"></List>
                            </mvc:content>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, appContext);
      expectExists(ui5Node, "UI5Node");
      expect(ui5Node.name).to.equal("showSeparators");
      expect(ui5Node.kind).equal("UI5Prop");
    });

    it("will get hover content UI5 property - incorrect key", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:content>
                              <List showSeparator⇶s1="All"></List>
                            </mvc:content>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, appContext);
      expect(ui5Node).to.be.undefined;
    });

    it("will get hover content UI5 property in unknown tag", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:content>
                              <List1 showSeparator⇶s="All"></List1>
                            </mvc:content>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, appContext);
      expect(ui5Node).to.be.undefined;
    });
  });

  context("hover on attribute value", () => {
    it("will get hover content UI5 enum", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:content>
                              <List showSeparators="Al⇶l"></List>
                            </mvc:content>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, appContext);
      expectExists(ui5Node, "UI5Node");
      expect(ui5Node.name).to.equal("All");
      expect(ui5Node.kind).equal("UI5EnumValue");
    });

    it("will get hover content UI5 property value for attribute which is not an enum", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:content>
                              <List busy="fal⇶se"></List>
                            </mvc:content>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, appContext);
      expect(ui5Node).to.be.undefined;
    });

    it("will get hover content UI5 property - incorrect enum", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:content>
                              <List1 showSeparators="Al⇶l1"></List1>
                            </mvc:content>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, appContext);
      expect(ui5Node).to.be.undefined;
    });

    it("will get hover content UI5 namespace", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sa⇶p.m"> 
                            <mvc:content>
                              <List showSeparators="All"></List>
                            </mvc:content>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, appContext);
      expectExists(ui5Node, "UI5Node");
      expect(ui5Node.name).to.equal("m");
      expect(ui5Node.kind).equal("UI5Namespace");
    });
  });

  context("hover on element open tag name", () => {
    it("will get hover content UI5 class", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:content>
                              <L⇶ist showSeparators="All"></List>
                            </mvc:content>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, appContext);
      expectExists(ui5Node, "UI5Node");
      expect(ui5Node.name).to.equal("List");
      expect(ui5Node.kind).equal("UI5Class");
    });

    it("will not get hover content UI5 class with a dot", () => {
      const xmlSnippet = `<core:mvc.Vi⇶ew
                            xmlns:core="sap.ui.core"> 
                          </core:mvc.View>`;
      const ui5Node = getUI5Node(xmlSnippet, appContext);
      expect(ui5Node).to.be.undefined;
    });

    it("will get hover content UI5 Aggregation", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:conten⇶t>
                              <List showSeparators="All"></List>
                            </mvc:content>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, appContext);
      expectExists(ui5Node, "UI5Node");
      expect(ui5Node.name).to.equal("content");
      expect(ui5Node.kind).equal("UI5Aggregation");
    });

    it("will get hover content UI5 Aggregation with a different namespace prefix that references the same namespace", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns:mvc2="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc2:conten⇶t>
                              <List showSeparators="All"></List>
                            </mvc2:content>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, appContext);
      expectExists(ui5Node, "UI5Node");
      expect(ui5Node.name).to.equal("content");
      expect(ui5Node.kind).equal("UI5Aggregation");
    });

    it("will get hover content UI5 Aggregation in the default namespace", () => {
      const xmlSnippet = `<View
                            xmlns="sap.ui.core.mvc"
                            xmlns:m="sap.m"> 
                            <conten⇶t>
                              <m:List showSeparators="All"></m:List>
                            </content>
                          </View>`;
      const ui5Node = getUI5Node(xmlSnippet, appContext);
      expectExists(ui5Node, "UI5Node");
      expect(ui5Node.name).to.equal("content");
      expect(ui5Node.kind).equal("UI5Aggregation");
    });

    it("will not get hover content for UI5 Aggregation in the wrong namespace", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns:m="sap.m"> 
                            <m:conten⇶t>
                              <m:List showSeparators="All"></m:List>
                            </m:content>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, appContext);
      expect(ui5Node).to.be.undefined;
    });

    it("will not get hover content UI5 Aggregation when only the aggregation doesn't have a namespace", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns:m="sap.m"> 
                            <conten⇶t>
                            </content>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, appContext);
      expect(ui5Node).to.be.undefined;
    });
  });

  context("hover on element close tag name", () => {
    it("will get hover content of unknown tag with unknown parent tag", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:content1>
                              <List1></Lis⇶t1>
                            </mvc:content1>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, appContext);
      expect(ui5Node).to.be.undefined;
    });

    it("will get hover content UI5 class", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:content>
                              <List showSeparators="All"></L⇶ist>
                            </mvc:content>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, appContext);
      expectExists(ui5Node, "UI5Node");
      expect(ui5Node.name).to.equal("List");
      expect(ui5Node.kind).equal("UI5Class");
    });

    it("will get hover content UI5 Aggregation", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:content>
                              <List showSeparators="All"></List>
                            </mvc:conte⇶nt>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, appContext);
      expectExists(ui5Node, "UI5Node");
      expect(ui5Node.name).to.equal("content");
      expect(ui5Node.kind).equal("UI5Aggregation");
    });

    it("will get hover content UI5 Aggregation with a different namespace prefix that references the same namespace", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns:mvc2="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc_TYPO:content>
                              <List showSeparators="All"></List>
                            </mvc2:conte⇶nt>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, appContext);
      expectExists(ui5Node, "UI5Node");
      expect(ui5Node.name).to.equal("content");
      expect(ui5Node.kind).equal("UI5Aggregation");
    });

    it("will get hover content UI5 Aggregation in the default namespace", () => {
      const xmlSnippet = `<View
                            xmlns="sap.ui.core.mvc"
                            xmlnsLm="sap.m"> 
                            <content>
                              <m:List showSeparators="All"></m:List>
                            </conte⇶nt>
                          </View>`;
      const ui5Node = getUI5Node(xmlSnippet, appContext);
      expectExists(ui5Node, "UI5Node");
      expect(ui5Node.name).to.equal("content");
      expect(ui5Node.kind).equal("UI5Aggregation");
    });

    it("will get hover content UI5 class with default namespace", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                          </Butt⇶on>`;
      const ui5Node = getUI5Node(xmlSnippet, appContext);
      expectExists(ui5Node, "UI5Node");
      expect(ui5Node.name).to.equal("Button");
      expect(ui5Node.kind).equal("UI5Class");
    });

    it("will not get hover content UI5 class with a dot", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns:core="sap.ui.core"> 
                          </core:mvc.Vi⇶ew>`;
      const ui5Node = getUI5Node(xmlSnippet, appContext);
      expect(ui5Node).to.be.undefined;
    });

    it("will not get hover content when only the close tag has the wrong namespace", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                          </m:Vie⇶w>`;
      const ui5Node = getUI5Node(xmlSnippet, appContext);
      expect(ui5Node).to.be.undefined;
    });

    it("will get hover content UI5 class when open and close tag are different", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <mvc:content></L⇶ist>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, appContext);
      expectExists(ui5Node, "UI5Node");
      expect(ui5Node.name).to.equal("List");
      expect(ui5Node.kind).equal("UI5Class");
    });
  });

  it("will get undefined hover content", () => {
    const xmlSnippet = `<mvc:View
                          xmlns:mvc="sap.ui.core.mvc"
                          xmlns="sap.m"> 
                          <mvc:content>
                            <List ⇶ showSeparators="All"></List>
                          </mvc:content>
                        </mvc:View>`;
    const ui5Node = getUI5Node(xmlSnippet, appContext);
    expect(ui5Node).to.be.undefined;
  });
});

function getUI5Node(
  xmlSnippet: string,
  context: AppContext
): BaseUI5Node | undefined {
  const { document, position } = getXmlSnippet(xmlSnippet);
  const { cst, tokenVector } = parse(document.getText());
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  const offset = document.offsetAt(position);
  const astPosition = astPositionAtOffset(ast, offset);
  if (astPosition !== undefined) {
    const ui5Node = findUI5HoverNodeAtOffset(astPosition, context);
    return ui5Node;
  }

  return undefined;
}

function getXmlSnippet(
  xmlSnippet: string
): {
  document: TextDocument;
  position: Position;
} {
  const xmlText = xmlSnippet.replace("⇶", "");
  const offset = xmlSnippet.indexOf("⇶");
  const document: TextDocument = createTextDocument("xml", xmlText);
  const position: Position = document.positionAt(offset);
  return { document, position };
}

function createTextDocument(languageId: string, content: string): TextDocument {
  return TextDocument.create("uri", languageId, 0, content);
}

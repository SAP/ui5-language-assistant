import { expect } from "chai";
import {
  UI5SemanticModel,
  BaseUI5Node,
} from "@ui5-language-assistant/semantic-model-types";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { getAstNodeInPosition } from "@xml-tools/ast-position";
import { findUI5HoverNodeAtOffset } from "../src/tooltip";
import {
  generateModel,
  expectExists,
} from "@ui5-language-assistant/test-utils";
import { TextDocument, Position } from "vscode-languageserver";
import { buildAst } from "@xml-tools/ast";

describe("the UI5 language assistant Hover Tooltip Service", () => {
  let ui5SemanticModel: UI5SemanticModel;
  before(async () => {
    ui5SemanticModel = await generateModel({ version: "1.74.0" });
  });

  context("hover on attribute key", () => {
    it("will get hover content UI5 property", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <content>
                              <List showSeparator⇶s="All"></List>
                            </content>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, ui5SemanticModel);
      expectExists(ui5Node, "UI5Node");
      expect(ui5Node.name).to.equal("showSeparators");
      expect(ui5Node.kind).equal("UI5Prop");
    });

    it("will get hover content UI5 property - incorrect key", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <content>
                              <List showSeparator⇶s1="All"></List>
                            </content>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, ui5SemanticModel);
      expect(ui5Node).to.not.exist;
    });
  });

  context("hover on attribute value", () => {
    it("will get hover content UI5 enum", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <content>
                              <List showSeparators="Al⇶l"></List>
                            </content>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, ui5SemanticModel);
      expectExists(ui5Node, "UI5Node");
      expect(ui5Node.name).to.equal("All");
      expect(ui5Node.kind).equal("UI5EnumValue");
    });

    it("will get hover content UI5 enum without information", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <content>
                              <List busy="fal⇶se"></List>
                            </content>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, ui5SemanticModel);
      expect(ui5Node).to.not.exist;
    });

    it("will get hover content UI5 property - incorrect enum", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <content>
                              <List1 showSeparators="Al⇶l1"></List1>
                            </content>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, ui5SemanticModel);
      expect(ui5Node).to.not.exist;
    });
  });

  context("hover on element open tag name", () => {
    it("will get hover content UI5 class", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <content>
                              <L⇶ist showSeparators="All"></List>
                            </content>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, ui5SemanticModel);
      expectExists(ui5Node, "UI5Node");
      expect(ui5Node.name).to.equal("List");
      expect(ui5Node.kind).equal("UI5Class");
    });

    it("will get hover content UI5 Aggregation", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <conten⇶t>
                              <List showSeparators="All"></List>
                            </content>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, ui5SemanticModel);
      expectExists(ui5Node, "UI5Node");
      expect(ui5Node.name).to.equal("content");
      expect(ui5Node.kind).equal("UI5Aggregation");
    });

    it("will get hover content UI5 namespace", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sa⇶p.m"> 
                            <content>
                              <List showSeparators="All"></List>
                            </content>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, ui5SemanticModel);
      expectExists(ui5Node, "UI5Node");
      expect(ui5Node.name).to.equal("m");
      expect(ui5Node.kind).equal("UI5Namespace");
    });

    it("will get hover content UI5 class - incorrect class name", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <content1>
                              <List1></Lis⇶t1>
                            </content1>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, ui5SemanticModel);
      expect(ui5Node).to.not.exist;
    });
  });

  context("hover on element close tag name", () => {
    it("will get hover content UI5 class", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <content>
                              <List showSeparators="All"></L⇶ist>
                            </content>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, ui5SemanticModel);
      expectExists(ui5Node, "UI5Node");
      expect(ui5Node.name).to.equal("List");
      expect(ui5Node.kind).equal("UI5Class");
    });

    it("will get hover content UI5 Aggregation", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <content>
                              <List showSeparators="All"></List>
                            </conte⇶nt>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, ui5SemanticModel);
      expectExists(ui5Node, "UI5Node");
      expect(ui5Node.name).to.equal("content");
      expect(ui5Node.kind).equal("UI5Aggregation");
    });

    it("will get hover content UI5 class with default namespace", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                          </Butt⇶on>`;
      const ui5Node = getUI5Node(xmlSnippet, ui5SemanticModel);
      expectExists(ui5Node, "UI5Node");
      expect(ui5Node.name).to.equal("Button");
      expect(ui5Node.kind).equal("UI5Class");
    });

    it("will get hover content UI5 class when namespace ofopen and close tag are different", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                          </m:Vie⇶w>`;
      const ui5Node = getUI5Node(xmlSnippet, ui5SemanticModel);
      expect(ui5Node).to.not.exist;
    });

    it("will get hover content UI5 class when open and close tag are different", () => {
      const xmlSnippet = `<mvc:View
                            xmlns:mvc="sap.ui.core.mvc"
                            xmlns="sap.m"> 
                            <content></L⇶ist>
                          </mvc:View>`;
      const ui5Node = getUI5Node(xmlSnippet, ui5SemanticModel);
      expectExists(ui5Node, "UI5Node");
      expect(ui5Node.name).to.equal("List");
      expect(ui5Node.kind).equal("UI5Class");
    });
  });

  it("will get undefined hover content", () => {
    const xmlSnippet = `<mvc:View
                          xmlns:mvc="sap.ui.core.mvc"
                          xmlns="sap.m"> 
                          <content>
                            <List ⇶ showSeparators="All"></List>
                          </content>
                        </mvc:View>`;
    const ui5Node = getUI5Node(xmlSnippet, ui5SemanticModel);
    expect(ui5Node).to.not.exist;
  });
});

function getUI5Node(
  xmlSnippet: string,
  ui5SemanticModel: UI5SemanticModel
): BaseUI5Node | undefined {
  const { document, position } = getXmlSnippet(xmlSnippet);
  const { cst, tokenVector } = parse(document.getText());
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  const offset = document.offsetAt(position);
  const astPosition = getAstNodeInPosition(ast, offset);
  if (astPosition !== undefined) {
    const ui5Node = findUI5HoverNodeAtOffset(astPosition, ui5SemanticModel);
    return ui5Node;
  }

  return undefined;
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

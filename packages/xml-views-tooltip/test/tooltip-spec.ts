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
import {
  TextDocument,
  Position,
  Hover,
  TextDocumentIdentifier,
  TextDocumentPositionParams,
} from "vscode-languageserver";
import { buildAst } from "@xml-tools/ast";

describe.only("the UI5 language assistant Hover Tooltip Service", () => {
  let ui5SemanticModel: UI5SemanticModel;
  before(async () => {
    ui5SemanticModel = await generateModel({ version: "1.74.0" });
  });

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
    expect(ui5Node.kind).equal("UI5Enum");
  });

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
  const xmlSnippetWithoutRanges = xmlSnippet
    .replace(/⭲/g, "")
    .replace(/⭰/g, "");
  const xmlText = xmlSnippetWithoutRanges.replace("⇶", "");
  const offset = xmlSnippetWithoutRanges.indexOf("⇶");
  const document: TextDocument = createTextDocument("xml", xmlText);
  const position: Position = document.positionAt(offset);
  return { document, position };
}

function createTextDocument(languageId: string, content: string): TextDocument {
  return TextDocument.create("uri", languageId, 0, content);
}

import { expect } from "chai";
import { TextDocument } from "vscode-languageserver";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { buildAst, XMLDocument } from "@xml-tools/ast";
import { expectExists } from "@ui5-language-assistant/test-utils";
import { computeQuickFixStableIdInfo } from "../src/quick-fix-id";

describe("the UI5 language assistant QuickFix Service", () => {
  context("true positive scenarios", () => {
    it("will get quick fix info when class is missing id attribute key", () => {
      const testXmlSnippet = `<mvc:View
                                xmlns:mvc="sap.ui.core.mvc"
                                xmlns="sap.m"> 
                                  <mvc:content>
                                    <🢂List🢀$></List>
                                  </mvc:content>
                              </mvc:View>`;
      const expectedSuggestion = ' id="_IDGenList1"';
      const { document, start, end, idStartOffest } = getXmlSnippet(
        testXmlSnippet
      );
      const testXmlDoc = getXmlDocument(document);
      const quickFixInfo = computeQuickFixStableIdInfo(testXmlDoc, {
        start,
        end,
      });
      expectExists(quickFixInfo, "Quick Fix Info");
      expect(quickFixInfo.suggestion).to.equal(expectedSuggestion);
      expect(quickFixInfo.offsetRange.start).to.equal(idStartOffest);
    });

    it("will get quick fix info when class is missing id attribute key - more than one id with different pattern", () => {
      const testXmlSnippet = `<mvc:View
                                xmlns:mvc="sap.ui.core.mvc"
                                xmlns="sap.m"> 
                                  <mvc:content>
                                    <List id="dummy-id"></List>
                                    <🢂List🢀$></List>
                                  </mvc:content>
                              </mvc:View>`;
      const expectedSuggestion = ' id="_IDGenList1"';
      const { document, start, end, idStartOffest } = getXmlSnippet(
        testXmlSnippet
      );
      const testXmlDoc = getXmlDocument(document);
      const quickFixInfo = computeQuickFixStableIdInfo(testXmlDoc, {
        start,
        end,
      });
      expectExists(quickFixInfo, "Quick Fix Info");
      expect(quickFixInfo.suggestion).to.equal(expectedSuggestion);
      expect(quickFixInfo.offsetRange.start).to.equal(idStartOffest);
    });

    it("will get quick fix info when class is missing id attribute key - more than one id from same pattern", () => {
      const testXmlSnippet = `<mvc:View
                                xmlns:mvc="sap.ui.core.mvc"
                                xmlns="sap.m"> 
                                  <mvc:content>
                                    <List id="_IDGenList2"></List>
                                    <List id="_IDGenList1"></List>
                                    <🢂List🢀$></List>
                                  </mvc:content>
                              </mvc:View>`;
      const expectedSuggestion = ' id="_IDGenList3"';
      const { document, start, end, idStartOffest } = getXmlSnippet(
        testXmlSnippet
      );
      const testXmlDoc = getXmlDocument(document);
      const quickFixInfo = computeQuickFixStableIdInfo(testXmlDoc, {
        start,
        end,
      });
      expectExists(quickFixInfo, "Quick Fix Info");
      expect(quickFixInfo.suggestion).to.equal(expectedSuggestion);
      expect(quickFixInfo.offsetRange.start).to.equal(idStartOffest);
    });

    it("will get quick fix info when class has empty id attribute", () => {
      const testXmlSnippet = `<mvc:View
                                xmlns:mvc="sap.ui.core.mvc"
                                xmlns="sap.m"> 
                                <mvc:content>
                                  <🢂List🢀 $id=""></List>
                                </mvc:content>
                              </mvc:View>`;
      const expectedSuggestion = 'id="_IDGenList1"';
      const { document, start, end, idStartOffest } = getXmlSnippet(
        testXmlSnippet
      );
      const testXmlDoc = getXmlDocument(document);
      const quickFixInfo = computeQuickFixStableIdInfo(testXmlDoc, {
        start,
        end,
      });
      expectExists(quickFixInfo, "Quick Fix Info");
      expect(quickFixInfo.suggestion).to.equal(expectedSuggestion);
      expect(quickFixInfo.offsetRange.start).to.equal(idStartOffest);
    });

    it("will get quick fix info when class has empty id attribute between other attributes", () => {
      const testXmlSnippet = `<mvc:View
                                xmlns:mvc="sap.ui.core.mvc"
                                xmlns="sap.m"> 
                                <mvc:content>
                                  <🢂List🢀 models="" $id="" footerText=""></List>
                                </mvc:content>
                              </mvc:View>`;
      const expectedSuggestion = 'id="_IDGenList1"';
      const { document, start, end, idStartOffest } = getXmlSnippet(
        testXmlSnippet
      );
      const testXmlDoc = getXmlDocument(document);
      const quickFixInfo = computeQuickFixStableIdInfo(testXmlDoc, {
        start,
        end,
      });
      expectExists(quickFixInfo, "Quick Fix Info");
      expect(quickFixInfo.suggestion).to.equal(expectedSuggestion);
      expect(quickFixInfo.offsetRange.start).to.equal(idStartOffest);
    });
  });

  context("true negative scenarios", () => {
    it("will not suggest quick fix id when the tag is empty", () => {
      const testXmlSnippet = `<mvc:View
                                xmlns:mvc="sap.ui.core.mvc"
                                xmlns="sap.m"> 
                                  <mvc:content>
                                    <🢂🢀></List>
                                  </mvc:content>
                              </mvc:View>`;
      const { document, start, end } = getXmlSnippet(testXmlSnippet);
      const testXmlDoc = getXmlDocument(document);
      const quickFixInfo = computeQuickFixStableIdInfo(testXmlDoc, {
        start,
        end,
      });

      expect(quickFixInfo).to.not.exist;
    });
  });
});

function getXmlDocument(document: TextDocument): XMLDocument {
  const { cst, tokenVector } = parse(document.getText());
  const ast = buildAst(cst as DocumentCstNode, tokenVector);

  return ast;
}

function getXmlSnippet(
  xmlSnippet: string
): {
  document: TextDocument;
  start: number;
  end: number;
  idStartOffest: number;
} {
  const start = xmlSnippet.indexOf("🢂");
  let xmlText = xmlSnippet.replace("🢂", "");
  const end = xmlSnippet.indexOf("🢀");
  xmlText = xmlText.replace("🢀", "");
  const idStartOffest = xmlText.indexOf("$");
  xmlText = xmlText.replace("$", "");
  const document: TextDocument = createTextDocument("xml", xmlText);
  return { document, start, end, idStartOffest };
}

function createTextDocument(languageId: string, content: string): TextDocument {
  return TextDocument.create("uri", languageId, 0, content);
}

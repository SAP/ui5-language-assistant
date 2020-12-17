import { expect } from "chai";
import { TextDocument } from "vscode-languageserver";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { buildAst, XMLDocument } from "@xml-tools/ast";
import { expectExists } from "@ui5-language-assistant/test-utils";
import { computeQuickFixStableIdInfo } from "../src/quick-fix-stable-id";

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
      const { document, quickFixStableIdTestInfo } = getXmlSnippet(
        testXmlSnippet
      );
      expect(quickFixStableIdTestInfo).to.not.be.empty;
      const testXmlDoc = getXmlDocument(document);
      const quickFixInfo = computeQuickFixStableIdInfo(testXmlDoc, [
        {
          start: quickFixStableIdTestInfo[0].start,
          end: quickFixStableIdTestInfo[0].end,
        },
      ]);
      expectExists(quickFixInfo, "Quick Fix Info");
      expect(quickFixInfo[0].newText).to.equal(' id="_IDGenList1"');
      expect(quickFixInfo[0].replaceRange.start).to.equal(
        quickFixStableIdTestInfo[0].idStartOffest
      );
    });

    it("will get quick fix suggestions when multiple classes are missing id attribute key", () => {
      const testXmlSnippet = `<mvc:View
                                xmlns:mvc="sap.ui.core.mvc"
                                xmlns="sap.m"> 
                                  <mvc:content>
                                    <🢂List🢀$></List>
                                    <🢂List🢀$></List>
                                  </mvc:content>
                              </mvc:View>`;
      const { document, quickFixStableIdTestInfo } = getXmlSnippet(
        testXmlSnippet
      );
      expect(quickFixStableIdTestInfo).to.not.be.empty;
      const testXmlDoc = getXmlDocument(document);
      const quickFixInfo = computeQuickFixStableIdInfo(testXmlDoc, [
        {
          start: quickFixStableIdTestInfo[0].start,
          end: quickFixStableIdTestInfo[0].end,
        },
        {
          start: quickFixStableIdTestInfo[1].start,
          end: quickFixStableIdTestInfo[1].end,
        },
      ]);
      expectExists(quickFixInfo, "Quick Fix Info");
      expect(quickFixInfo[0].newText).to.equal(' id="_IDGenList1"');
      expect(quickFixInfo[0].replaceRange.start).to.equal(
        quickFixStableIdTestInfo[0].idStartOffest
      );
      expect(quickFixInfo[1].newText).to.equal(' id="_IDGenList2"');
      expect(quickFixInfo[1].replaceRange.start).to.equal(
        quickFixStableIdTestInfo[1].idStartOffest
      );
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
      const { document, quickFixStableIdTestInfo } = getXmlSnippet(
        testXmlSnippet
      );
      expect(quickFixStableIdTestInfo).to.not.be.empty;
      const testXmlDoc = getXmlDocument(document);
      const quickFixInfo = computeQuickFixStableIdInfo(testXmlDoc, [
        {
          start: quickFixStableIdTestInfo[0].start,
          end: quickFixStableIdTestInfo[0].end,
        },
      ]);
      expectExists(quickFixInfo, "Quick Fix Info");
      expect(quickFixInfo[0].newText).to.equal(expectedSuggestion);
      expect(quickFixInfo[0].replaceRange.start).to.equal(
        quickFixStableIdTestInfo[0].idStartOffest
      );
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
      const { document, quickFixStableIdTestInfo } = getXmlSnippet(
        testXmlSnippet
      );
      expect(quickFixStableIdTestInfo).to.not.be.empty;
      const testXmlDoc = getXmlDocument(document);
      const quickFixInfo = computeQuickFixStableIdInfo(testXmlDoc, [
        {
          start: quickFixStableIdTestInfo[0].start,
          end: quickFixStableIdTestInfo[0].end,
        },
      ]);
      expectExists(quickFixInfo, "Quick Fix Info");
      expect(quickFixInfo[0].newText).to.equal(expectedSuggestion);
      expect(quickFixInfo[0].replaceRange.start).to.equal(
        quickFixStableIdTestInfo[0].idStartOffest
      );
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
      const { document, quickFixStableIdTestInfo } = getXmlSnippet(
        testXmlSnippet
      );
      expect(quickFixStableIdTestInfo).to.not.be.empty;
      const testXmlDoc = getXmlDocument(document);
      const quickFixInfo = computeQuickFixStableIdInfo(testXmlDoc, [
        {
          start: quickFixStableIdTestInfo[0].start,
          end: quickFixStableIdTestInfo[0].end,
        },
      ]);
      expectExists(quickFixInfo, "Quick Fix Info");
      expect(quickFixInfo[0].newText).to.equal(expectedSuggestion);
      expect(quickFixInfo[0].replaceRange.start).to.equal(
        quickFixStableIdTestInfo[0].idStartOffest
      );
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
      const { document, quickFixStableIdTestInfo } = getXmlSnippet(
        testXmlSnippet
      );
      expect(quickFixStableIdTestInfo).to.not.be.empty;
      const testXmlDoc = getXmlDocument(document);
      const quickFixInfo = computeQuickFixStableIdInfo(testXmlDoc, [
        {
          start: quickFixStableIdTestInfo[0].start,
          end: quickFixStableIdTestInfo[0].end,
        },
      ]);
      expectExists(quickFixInfo, "Quick Fix Info");
      expect(quickFixInfo[0].newText).to.equal(expectedSuggestion);
      expect(quickFixInfo[0].replaceRange.start).to.equal(
        quickFixStableIdTestInfo[0].idStartOffest
      );
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
      const { document, quickFixStableIdTestInfo } = getXmlSnippet(
        testXmlSnippet
      );
      const testXmlDoc = getXmlDocument(document);
      const quickFixInfo = computeQuickFixStableIdInfo(testXmlDoc, [
        {
          start: quickFixStableIdTestInfo[0].start,
          end: quickFixStableIdTestInfo[0].end,
        },
      ]);

      expect(quickFixInfo).to.be.empty;
    });
  });
});

function getXmlDocument(document: TextDocument): XMLDocument {
  const { cst, tokenVector } = parse(document.getText());
  const ast = buildAst(cst as DocumentCstNode, tokenVector);

  return ast;
}

type QuickFixStableIdTestInfo = {
  start: number;
  end: number;
  idStartOffest: number;
};

function getXmlSnippet(
  xmlSnippet: string
): {
  document: TextDocument;
  quickFixStableIdTestInfo: QuickFixStableIdTestInfo[];
} {
  const quickFixStableIdTestInfo: QuickFixStableIdTestInfo[] = [];
  let xmlText = xmlSnippet;
  while (xmlText.indexOf("🢂") !== -1 && xmlText.indexOf("🢀") !== -1) {
    const start = xmlText.indexOf("🢂");
    xmlText = xmlText.replace("🢂", "");
    const end = xmlText.indexOf("🢀");
    xmlText = xmlText.replace("🢀", "");
    const idStartOffest = xmlText.indexOf("$");
    xmlText = xmlText.replace("$", "");
    quickFixStableIdTestInfo.push({ start, end, idStartOffest });
  }
  const document: TextDocument = createTextDocument("xml", xmlText);
  return { document, quickFixStableIdTestInfo };
}

function createTextDocument(languageId: string, content: string): TextDocument {
  return TextDocument.create("uri", languageId, 0, content);
}

import { expect } from "chai";
import { TextDocument } from "vscode-languageserver";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { buildAst, XMLDocument } from "@xml-tools/ast";
import { expectExists } from "@ui5-language-assistant/test-utils";
import { computeQuickFixHardcodedI18nStringInfo } from "../src/quick-fix-hardcoded-i18n-string";
import * as propertiesParser from "properties-file/content";

describe("the UI5 language assistant QuickFix Service", () => {
  context("true positive scenarios", () => {
    it("will get quick fix info when i18n-able attribute key is hardcoded", () => {
      const testXmlSnippet = `<mvc:View
                                xmlns:mvc="sap.ui.core.mvc"
                                xmlns="sap.m"> 
                                  <mvc:content>
                                    <Button text=🢂"i18n_dummy_text"🢀/>
                                  </mvc:content>
                              </mvc:View>`;
      const { document, quickFixHardcodedI18nStringTestInfo } = getXmlSnippet(
        testXmlSnippet
      );
      expect(quickFixHardcodedI18nStringTestInfo).to.not.be.empty;
      const testXmlDoc = getXmlDocument(document);
      const resourceBundle = propertiesParser.getProperties(
        "lbI18nDummyText=i18n_dummy_text"
      );
      const properties = resourceBundle.collection;
      const quickFixInfo = computeQuickFixHardcodedI18nStringInfo(
        testXmlDoc,
        [
          {
            start: quickFixHardcodedI18nStringTestInfo[0].start,
            end: quickFixHardcodedI18nStringTestInfo[0].end,
          },
        ],
        properties
      );
      expectExists(quickFixInfo, "Quick Fix Info");
      expect(quickFixInfo[0].newTextSuggestions[0].newText).to.equal(
        "{i18n>lbI18nDummyText}"
      );
      expect(quickFixInfo[0].replaceRange.start).to.equal(
        quickFixHardcodedI18nStringTestInfo[0].start
      );
      expect(quickFixInfo[0].replaceRange.end).to.equal(
        quickFixHardcodedI18nStringTestInfo[0].end
      );
    });
  });

  context("true negative scenarios", () => {
    it("will i18n not suggest quick fix id when the tag is empty", () => {
      const testXmlSnippet = `<mvc:View
                                xmlns:mvc="sap.ui.core.mvc"
                                xmlns="sap.m"> 
                                  <mvc:content>
                                    <Button text=🢂""🢀/>
                                  </mvc:content>
                              </mvc:View>`;
      const resourceBundle = propertiesParser.getProperties(
        "lbI18nDummyText=i18n_dummy_text"
      );
      const properties = resourceBundle.collection;
      const { document, quickFixHardcodedI18nStringTestInfo } = getXmlSnippet(
        testXmlSnippet
      );
      const testXmlDoc = getXmlDocument(document);
      const quickFixInfo = computeQuickFixHardcodedI18nStringInfo(
        testXmlDoc,
        [
          {
            start: quickFixHardcodedI18nStringTestInfo[0].start,
            end: quickFixHardcodedI18nStringTestInfo[0].end,
          },
        ],
        properties
      );

      expect(quickFixInfo).to.be.empty;
    });
  });
});

function getXmlDocument(document: TextDocument): XMLDocument {
  const { cst, tokenVector } = parse(document.getText());
  const ast = buildAst(cst as DocumentCstNode, tokenVector);

  return ast;
}

type QuickFixHardcodedI18nStringTestInfo = {
  start: number;
  end: number;
};

function getXmlSnippet(
  xmlSnippet: string
): {
  document: TextDocument;
  quickFixHardcodedI18nStringTestInfo: QuickFixHardcodedI18nStringTestInfo[];
} {
  const quickFixHardcodedI18nStringTestInfo: QuickFixHardcodedI18nStringTestInfo[] = [];
  let xmlText = xmlSnippet;
  while (xmlText.indexOf("🢂") !== -1 && xmlText.indexOf("🢀") !== -1) {
    const start = xmlText.indexOf("🢂");
    xmlText = xmlText.replace("🢂", "");
    const end = xmlText.indexOf("🢀");
    xmlText = xmlText.replace("🢀", "");
    xmlText = xmlText.replace("$", "");
    quickFixHardcodedI18nStringTestInfo.push({ start, end });
  }
  const document: TextDocument = createTextDocument("xml", xmlText);
  return { document, quickFixHardcodedI18nStringTestInfo };
}

function createTextDocument(languageId: string, content: string): TextDocument {
  return TextDocument.create("uri", languageId, 0, content);
}

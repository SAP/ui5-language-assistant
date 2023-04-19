import { expect } from "chai";
import { isXMLView } from "../../src/utils/document";

describe("The @ui5-language-assistant/logic-utils/document", () => {
  context("isView", () => {
    context("true", () => {
      it("check .view.xml", () => {
        const result = isXMLView("test/file/main.view.xml");
        expect(result).to.be.true;
      });
      it("check .fragment.xml", () => {
        const result = isXMLView("test/file/ext.fragment.xml");
        expect(result).to.be.true;
      });
    });
    context("false", () => {
      it("check view.xml", () => {
        const result = isXMLView("test/file/mainview.xml");
        expect(result).to.be.false;
      });
      it("check fragment.xml", () => {
        const result = isXMLView("test/file/extfragment.xml");
        expect(result).to.be.false;
      });
      it("check .view.ml", () => {
        const result = isXMLView("test/file/main.view.xm");
        expect(result).to.be.false;
      });
      it("check .frag.xml", () => {
        const result = isXMLView("test/file/ext.frag.xml");
        expect(result).to.be.false;
      });
    });
  });
});

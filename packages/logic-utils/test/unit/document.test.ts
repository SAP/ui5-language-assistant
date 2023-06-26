import { isXMLView } from "../../src/utils/document";

describe("The @ui5-language-assistant/logic-utils/document", () => {
  describe("isView", () => {
    describe("true", () => {
      it("check .view.xml", () => {
        const result = isXMLView("test/file/main.view.xml");
        expect(result).toBeTrue();
      });
      it("check .fragment.xml", () => {
        const result = isXMLView("test/file/ext.fragment.xml");
        expect(result).toBeTrue();
      });
    });
    describe("false", () => {
      it("check view.xml", () => {
        const result = isXMLView("test/file/mainview.xml");
        expect(result).toBeFalse();
      });
      it("check fragment.xml", () => {
        const result = isXMLView("test/file/extfragment.xml");
        expect(result).toBeFalse();
      });
      it("check .view.ml", () => {
        const result = isXMLView("test/file/main.view.xm");
        expect(result).toBeFalse();
      });
      it("check .frag.xml", () => {
        const result = isXMLView("test/file/ext.frag.xml");
        expect(result).toBeFalse();
      });
    });
  });
});

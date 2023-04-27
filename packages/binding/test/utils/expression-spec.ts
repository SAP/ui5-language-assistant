import { expect } from "chai";
import {
  isPropertyBindingInfoWitProperties,
  extractBindingExpression,
  isBindingExpression,
} from "../../src/utils";
describe("expression", () => {
  context("isBindingExpression", () => {
    it("check binding expressiong {=", () => {
      const result = isBindingExpression("{=");
      expect(result).to.be.true;
    });
    it("check  binding expressiong {:=", () => {
      const result = isBindingExpression("{:=");
      expect(result).to.be.true;
    });
    it("check other false cases", () => {
      const result = isBindingExpression("{");
      expect(result).to.be.false;
    });
  });
  context("isPropertyBindingInfoWitProperties", () => {
    it("check false", () => {
      const result = isPropertyBindingInfoWitProperties(
        "{/path/to/property/of/a/model}"
      );
      expect(result).to.be.false;
    });
    it("check true", () => {
      const result = isPropertyBindingInfoWitProperties(
        '{"/path/to/property/of/a/model"}'
      );
      expect(result).to.be.true;
    });
  });
  // context("extractBindingExpression", () => {
  //   it("check ....", () => {
  //     const result = extractBindingExpression(
  //       "any text here: \{ \{:= \{= { ${/company/zip} === '03301 \{ aa' } other text"
  //     );
  //     expect(result).to.be.false;
  //   });
  // });
});

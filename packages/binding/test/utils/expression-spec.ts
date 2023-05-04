import { expect } from "chai";
import { isBindingExpression } from "../../src/utils";
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
});

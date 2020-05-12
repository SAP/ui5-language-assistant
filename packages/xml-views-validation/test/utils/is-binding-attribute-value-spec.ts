import { expect } from "chai";
import { isPossibleBindingAttributeValue } from "../../src/utils/is-binding-attribute-value";

describe("isPossibleBindingAttributeValue", () => {
  it("returns false for a string without curly brackets", () => {
    expect(isPossibleBindingAttributeValue("abc"), "abc").to.be.false;
  });

  it("returns false for an empty string", () => {
    expect(isPossibleBindingAttributeValue("")).to.be.false;
  });

  it("returns false for a string with only an opening curly bracket", () => {
    expect(isPossibleBindingAttributeValue("{"), "abc").to.be.false;
  });

  it("returns true for a string starting and ending with curly brackets without anything in the middle", () => {
    expect(isPossibleBindingAttributeValue("{}"), "{}").to.be.true;
  });

  it("returns true for a string starting and ending with curly brackets with text in the middle", () => {
    expect(isPossibleBindingAttributeValue("{model>field}"), "{model>field}").to
      .be.true;
  });

  it("returns true for a string starting with a curly bracket that has a closing bracket", () => {
    expect(isPossibleBindingAttributeValue("{}:"), "{}:").to.be.true;
  });

  it("returns true for a string containing curly brackets in the middle", () => {
    expect(isPossibleBindingAttributeValue("see {}:"), "see {}:").to.be.true;
  });
});

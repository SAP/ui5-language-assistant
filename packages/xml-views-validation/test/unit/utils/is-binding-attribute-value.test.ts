import { isPossibleBindingAttributeValue } from "../../../src/utils/is-binding-attribute-value";

describe("isPossibleBindingAttributeValue", () => {
  describe("matching cases", () => {
    it("returns true for a string with only an opening curly bracket", () => {
      expect(isPossibleBindingAttributeValue("{")).toBeTrue();
    });

    it("returns true for a string starting and ending with curly brackets without anything in the middle", () => {
      expect(isPossibleBindingAttributeValue("{}")).toBeTrue();
    });

    it("returns true for a string starting and ending with curly brackets with text in the middle", () => {
      expect(isPossibleBindingAttributeValue("{model>field}")).toBeTrue();
    });

    it("returns true for a string starting and ending with curly brackets with brackets in the middle", () => {
      expect(isPossibleBindingAttributeValue("{= ${path1} * 2}")).toBeTrue();
    });

    it("returns true for a string starting with a curly bracket that has a closing bracket", () => {
      expect(isPossibleBindingAttributeValue("{}:")).toBeTrue();
    });

    it("returns true for a string containing curly brackets in the middle", () => {
      expect(isPossibleBindingAttributeValue("see {}:")).toBeTrue();
    });

    it("returns true for a string with an escaped and unescaped opening curly bracket", () => {
      expect(isPossibleBindingAttributeValue("\\{a{")).toBeTrue();
    });

    it("returns true for a string with an escaped character which is not an opening curly bracket", () => {
      expect(isPossibleBindingAttributeValue("\\a{")).toBeTrue();
    });

    it("returns true for a string with an escaped backslash followed by an opening curly bracket", () => {
      expect(isPossibleBindingAttributeValue("\\\\{")).toBeTrue();
    });
  });

  describe("non-matching cases", () => {
    it("returns false for a string without curly brackets", () => {
      expect(isPossibleBindingAttributeValue("abc")).toBeFalse();
    });

    it("returns false for an empty string", () => {
      expect(isPossibleBindingAttributeValue("")).toBeFalse();
    });

    it("returns false for a string with an escaped opening curly bracket", () => {
      expect(isPossibleBindingAttributeValue("\\{")).toBeFalse();
    });

    it("returns true for a string with an escaped backslash followed by an escaped opening curly bracket", () => {
      expect(isPossibleBindingAttributeValue("\\\\\\{")).toBeFalse();
    });
  });
});

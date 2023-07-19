import { parseBinding } from "../../../src/parser";
import {
  isBindingExpression,
  isMetadataPath,
  isModel,
  isPropertyBindingInfo,
} from "../../../src/utils";

describe("expression", () => {
  describe("isBindingExpression", () => {
    it("check binding expression {=", () => {
      const result = isBindingExpression("{=");
      expect(result).toBeTrue();
    });
    it("check  binding expression {:=", () => {
      const result = isBindingExpression("{:=");
      expect(result).toBeTrue();
    });
    it("check other false cases", () => {
      const result = isBindingExpression("{");
      expect(result).toBeFalse();
    });
  });
  describe("isPropertyBindingInfo", () => {
    it("empty string", () => {
      const input = "  ";
      const { ast, errors } = parseBinding(input);
      const result = isPropertyBindingInfo(input, ast.bindings[0], errors);
      expect(result).toBeTrue();
    });
    it("string value", () => {
      const input = "40";
      const { ast, errors } = parseBinding(input);
      const result = isPropertyBindingInfo(input, ast.bindings[0], errors);
      expect(result).toBeFalse();
    });
    it("empty curly bracket without space", () => {
      const input = "{}";
      const { ast, errors } = parseBinding(input);
      const result = isPropertyBindingInfo(input, ast.bindings[0], errors);
      expect(result).toBeTrue();
    });
    it("empty curly bracket with space", () => {
      const input = "{   }";
      const { ast, errors } = parseBinding(input);
      const result = isPropertyBindingInfo(input, ast.bindings[0], errors);
      expect(result).toBeTrue();
    });
    it("key with colone [true]", () => {
      const input = ' {path: "some/path"}';
      const { ast, errors } = parseBinding(input);
      const result = isPropertyBindingInfo(input, ast.bindings[0], errors);
      expect(result).toBeTrue();
    });
    it("key with colone any where [true]", () => {
      const input = ' {path "some/path", thisKey: {}}';
      const { ast, errors } = parseBinding(input);
      const result = isPropertyBindingInfo(input, ast.bindings[0], errors);
      expect(result).toBeTrue();
    });
    it("missing colon [false]", () => {
      const input = '{path "some/path"}';
      const { ast, errors } = parseBinding(input);
      const result = isPropertyBindingInfo(input, ast.bindings[0], errors);
      expect(result).toBeFalse();
    });
    it("contains > after first key [false]", () => {
      const input = "{i18n>myTestModel}";
      const { ast, errors } = parseBinding(input);
      const result = isPropertyBindingInfo(input, ast.bindings[0], errors);
      expect(result).toBeFalse();
    });
    it("contains / before first key [false]", () => {
      const input = "{/oData/path/to/some/dynamic/value}";
      const { ast, errors } = parseBinding(input);
      const result = isPropertyBindingInfo(input, ast.bindings[0], errors);
      expect(result).toBeFalse();
    });
    it("contains / after first key [false]", () => {
      const input = "{/oData/path/to/some/dynamic/value}";
      const { ast, errors } = parseBinding(input);
      const result = isPropertyBindingInfo(input, ast.bindings[0], errors);
      expect(result).toBeFalse();
    });
  });

  describe("isModel", () => {
    it("return false if errors is undefined", () => {
      const input = "{path: 'acceptable'}";
      const { ast } = parseBinding(input);
      expect(isModel(ast.bindings[0])).toBe(false);
    });

    it("return true if model sign appears after first key", () => {
      const input = "{oData>/path/to/a/value}";
      const { ast, errors } = parseBinding(input);
      expect(isModel(ast.bindings[0], errors)).toBe(true);
    });

    it("return false if model sign does not appear after first key", () => {
      const input = "{i18n >}"; // space is not allowed
      const { ast, errors } = parseBinding(input);
      expect(isModel(ast.bindings[0], errors)).toBe(false);
    });

    it("return false if model sign is not found", () => {
      const input = "{path: 'acceptable'}";
      const { ast, errors } = parseBinding(input);
      expect(isModel(ast.bindings[0], errors)).toBe(false);
    });
    it("return false if key is with single quote", () => {
      const input = "{'path'>: ''}";
      const { ast, errors } = parseBinding(input);
      expect(isModel(ast.bindings[0], errors)).toBe(false);
    });
    it("return false if key is with double quotes", () => {
      const input = '{"path">: ""}';
      const { ast, errors } = parseBinding(input);
      expect(isModel(ast.bindings[0], errors)).toBe(false);
    });
    it("return false if key is with single quote [HTML equivalent]", () => {
      const input = "{&apos;path&apos;>: ''}";
      const { ast, errors } = parseBinding(input);
      expect(isModel(ast.bindings[0], errors)).toBe(false);
    });
    it("return false if key is with double quotes [HTML equivalent]", () => {
      const input = "{&quot;path&quot;>: ''}";
      const { ast, errors } = parseBinding(input);
      expect(isModel(ast.bindings[0], errors)).toBe(false);
    });
  });
  describe("isMetadataPath", () => {
    it("return false if errors is undefined", () => {
      const input = "{/path/to/a/value}'}";
      const { ast } = parseBinding(input);
      expect(isMetadataPath(ast.bindings[0])).toBe(false);
    });
    it("return false if there is no metadata separator", () => {
      const input = "{path: 'acceptable'}";
      const { ast, errors } = parseBinding(input);
      expect(isMetadataPath(ast.bindings[0], errors)).toBe(false);
    });

    it("return true if the metadata separator is before adjacent first key", () => {
      const input = "{/path/to/a/value}";
      const { ast, errors } = parseBinding(input);
      expect(isMetadataPath(ast.bindings[0], errors)).toBe(true);
    });

    it("return true if the metadata separator is after adjacent first key", () => {
      const input = "{path/to/a/value}";
      const { ast, errors } = parseBinding(input);
      expect(isMetadataPath(ast.bindings[0], errors)).toBe(true);
    });
  });
});

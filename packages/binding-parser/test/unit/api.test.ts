import {
  isPrimitiveValue,
  isCollectionValue,
  isStructureValue,
  parsePropertyBindingInfo,
} from "../../src/api";

describe("api", () => {
  describe("isPrimitiveValue", () => {
    it("false [undefined]", () => {
      const result = isPrimitiveValue(undefined);
      expect(result).toBeFalse();
    });
    it("false [isCollectionValue(value)]", () => {
      const { ast } = parsePropertyBindingInfo("{key: []}");
      const value = ast.bindings[0].elements[0].value;
      const result = isPrimitiveValue(value);
      expect(result).toBeFalse();
    });
    it("false [isStructureValue(value)]", () => {
      const { ast } = parsePropertyBindingInfo("{key: {} }");
      const value = ast.bindings[0].elements[0].value;
      const result = isPrimitiveValue(value);
      expect(result).toBeFalse();
    });
    it("true", () => {
      const { ast } = parsePropertyBindingInfo("{key: 123 }");
      const value = ast.bindings[0].elements[0].value;
      const result = isPrimitiveValue(value);
      expect(result).toBeTrue();
    });
  });
  describe("isCollectionValue", () => {
    it("false [undefined]", () => {
      const result = isCollectionValue(undefined);
      expect(result).toBeFalse();
    });
    it("false [type !== collection-value]", () => {
      const { ast } = parsePropertyBindingInfo("{key: {} }");
      const value = ast.bindings[0].elements[0].value;
      const result = isCollectionValue(value);
      expect(result).toBeFalse();
    });
    it("true [type === collection-value]", () => {
      const { ast } = parsePropertyBindingInfo("{key: [] }");
      const value = ast.bindings[0].elements[0].value;
      const result = isCollectionValue(value);
      expect(result).toBeTrue();
    });
  });
  describe("isStructureValue", () => {
    it("false [undefined]", () => {
      const result = isStructureValue(undefined);
      expect(result).toBeFalse();
    });
    it("false [type !== structure-value]", () => {
      const { ast } = parsePropertyBindingInfo("{key: [] }");
      const value = ast.bindings[0].elements[0].value;
      const result = isStructureValue(value);
      expect(result).toBeFalse();
    });
    it("true [type === structure-value]", () => {
      const { ast } = parsePropertyBindingInfo("{key: {} }");
      const value = ast.bindings[0].elements[0].value;
      const result = isStructureValue(value);
      expect(result).toBeTrue();
    });
  });
});

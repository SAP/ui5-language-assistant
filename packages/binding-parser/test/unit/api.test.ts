import {
  isPrimitiveValue,
  isCollectionValue,
  isStructureValue,
  PropertyBindingInfoTypes,
} from "../../src/api";

describe("api", () => {
  describe("isPrimitiveValue", () => {
    it("false [undefined]", () => {
      const result = isPrimitiveValue(undefined);
      expect(result).toBeFalse();
    });
    it("false [has elements]", () => {
      const value = {
        elements: [{}],
      } as PropertyBindingInfoTypes.Value;
      const result = isPrimitiveValue(value);
      expect(result).toBeFalse();
    });
    it("true", () => {
      const value = {} as PropertyBindingInfoTypes.Value;
      const result = isPrimitiveValue(value);
      expect(result).toBeTrue();
    });
  });
  describe("isCollectionValue", () => {
    it("false [undefined]", () => {
      const result = isCollectionValue(undefined);
      expect(result).toBeFalse();
    });
    it("false [does not have left square or right square]", () => {
      const value = {} as PropertyBindingInfoTypes.Value;
      const result = isCollectionValue(value);
      expect(result).toBeFalse();
    });
    it("true [left square]", () => {
      const value = { leftSquare: {} } as PropertyBindingInfoTypes.Value;
      const result = isCollectionValue(value);
      expect(result).toBeTrue();
    });
    it("true [right square]", () => {
      const value = { rightSquare: {} } as PropertyBindingInfoTypes.Value;
      const result = isCollectionValue(value);
      expect(result).toBeTrue();
    });
  });
  describe("isStructureValue", () => {
    it("false [undefined]", () => {
      const result = isStructureValue(undefined);
      expect(result).toBeFalse();
    });
    it("false [does not have left curly or right curly]", () => {
      const value = {} as PropertyBindingInfoTypes.Value;
      const result = isStructureValue(value);
      expect(result).toBeFalse();
    });
    it("true [left curly]", () => {
      const value = { leftCurly: {} } as PropertyBindingInfoTypes.Value;
      const result = isStructureValue(value);
      expect(result).toBeTrue();
    });
    it("true [right curly]", () => {
      const value = { rightCurly: {} } as PropertyBindingInfoTypes.Value;
      const result = isStructureValue(value);
      expect(result).toBeTrue();
    });
  });
});

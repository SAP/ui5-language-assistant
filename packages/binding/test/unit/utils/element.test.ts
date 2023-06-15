import { findRange, typesToValue } from "../../../src/utils";
import { propertyBindingInfoElements } from "../../../src/definition/definition";
import { PropertyBindingInfoElement, BindContext } from "../../../src/types";

describe("element", () => {
  describe("typesToValue", () => {
    describe('type.kind === "string"', () => {
      it("type.collection && collectionValue === false)", () => {
        const el = propertyBindingInfoElements.find(
          (i) => i.name === "parts"
        ) as PropertyBindingInfoElement;
        const result = typesToValue(
          el.type,
          { doubleQuotes: false } as BindContext,
          0,
          false
        );
        expect(result).toStrictEqual(["[{$0}]", '["$0"]']);
      });
      it("empty string", () => {
        const el = propertyBindingInfoElements.find(
          (i) => i.name === "path"
        ) as PropertyBindingInfoElement;
        const result = typesToValue(el.type, {
          doubleQuotes: false,
        } as BindContext);
        expect(result).toStrictEqual(['"$0"']);
      });
    });
    describe('type.kind === "boolean"', () => {
      it("type.collection && collectionValue === false", () => {
        let el = propertyBindingInfoElements.find(
          (i) => i.name === "suspended"
        ) as PropertyBindingInfoElement;
        // for test - set collection as true
        el = { ...el, type: [{ ...el.type[0], collection: true }] };
        const result = typesToValue(
          el.type,
          { doubleQuotes: false } as BindContext,
          0,
          false
        );
        expect(result).toStrictEqual(["[true, false]"]);
      });
      it("true false", () => {
        const el = propertyBindingInfoElements.find(
          (i) => i.name === "suspended"
        ) as PropertyBindingInfoElement;
        const result = typesToValue(el.type, {
          doubleQuotes: false,
        } as BindContext);
        expect(result).toStrictEqual(["true", "false"]);
      });
    });
    describe('type.kind === "object")', () => {
      it("type.collection && collectionValue === false", () => {
        let el = propertyBindingInfoElements.find(
          (i) => i.name === "formatOptions"
        ) as PropertyBindingInfoElement;
        // for test - set collection as true
        el = { ...el, type: [{ ...el.type[0], collection: true }] };
        const result = typesToValue(
          el.type,
          { doubleQuotes: false } as BindContext,
          0,
          false
        );
        expect(result).toStrictEqual(["[{$0}]"]);
      });
      it("{ }", () => {
        const el = propertyBindingInfoElements.find(
          (i) => i.name === "formatOptions"
        ) as PropertyBindingInfoElement;
        const result = typesToValue(el.type, {
          doubleQuotes: false,
        } as BindContext);
        expect(result).toStrictEqual(["{$0}"]);
      });
    });
  });
  describe("findRange", () => {
    it("finds ranges", () => {
      const range = {
        start: { line: 5, character: 10 },
        end: { line: 5, character: 15 },
      };
      const result = findRange([range]);
      expect(result).toStrictEqual(range);
    });
    it("default ranges", () => {
      const range = {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 0 },
      };
      const result = findRange([range]);
      expect(result).toStrictEqual(range);
    });
  });
});

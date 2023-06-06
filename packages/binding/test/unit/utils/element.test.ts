import { typesToValue } from "../../../src/utils";
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
          false
        );
        expect(result).toStrictEqual(["[{ }]", '[" "]']);
      });
      it("empty string", () => {
        const el = propertyBindingInfoElements.find(
          (i) => i.name === "path"
        ) as PropertyBindingInfoElement;
        const result = typesToValue(el.type, {
          doubleQuotes: false,
        } as BindContext);
        expect(result).toStrictEqual(['" "']);
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
          false
        );
        expect(result).toStrictEqual(["[{ }]"]);
      });
      it("{ }", () => {
        const el = propertyBindingInfoElements.find(
          (i) => i.name === "formatOptions"
        ) as PropertyBindingInfoElement;
        const result = typesToValue(el.type, {
          doubleQuotes: false,
        } as BindContext);
        expect(result).toStrictEqual(["{ }"]);
      });
    });
  });
});

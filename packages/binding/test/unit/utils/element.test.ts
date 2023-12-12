import { findRange, typesToValue } from "../../../src/utils";
import { getBindingElements } from "../../../src/definition/definition";
import { BindingInfoElement, BindContext } from "../../../src/types";
import { getContext } from "@ui5-language-assistant/context";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import { join } from "path";
import type { UI5Aggregation } from "@ui5-language-assistant/semantic-model-types";

const aggregation = {} as UI5Aggregation;
let context: BindContext;
describe("element", () => {
  describe("typesToValue", () => {
    beforeAll(async () => {
      const config: Config = {
        projectInfo: {
          name: ProjectName.cap,
          type: ProjectType.CAP,
          npmInstall: true,
          deleteBeforeCopy: false,
        },
      };
      const framework = new TestFramework(config);
      const viewFilePathSegments = [
        "app",
        "manage_travels",
        "webapp",
        "ext",
        "main",
        "Main.view.xml",
      ];
      const root = framework.getProjectRoot();
      const documentPath = join(root, ...viewFilePathSegments);
      context = (await getContext(documentPath)) as BindContext;
    });
    describe('type.kind === "string"', () => {
      it("type.collection && collectionValue === false) [without tab stop]", () => {
        const el = getBindingElements(context).find(
          (i) => i.name === "parts"
        ) as BindingInfoElement;
        const result = typesToValue({
          types: el.type,
          context: { doubleQuotes: false } as BindContext,
          tabStop: undefined,
          collectionValue: false,
        });
        expect(result).toStrictEqual(['[""]', "[{ }]"]);
      });
      it("type.collection && collectionValue === false) [with tab stop]", () => {
        const el = getBindingElements(context).find(
          (i) => i.name === "parts"
        ) as BindingInfoElement;
        const result = typesToValue({
          types: el.type,
          context: { doubleQuotes: false } as BindContext,
          tabStop: 0,
          collectionValue: false,
        });
        expect(result).toStrictEqual(['["$0"]', "[{$0}]"]);
      });
      it("empty string [with tab stop]", () => {
        const el = getBindingElements(context).find(
          (i) => i.name === "path"
        ) as BindingInfoElement;
        const result = typesToValue({
          types: el.type,
          context: {
            doubleQuotes: false,
          } as BindContext,
          tabStop: 0,
        });
        expect(result).toStrictEqual(['"$0"']);
      });
      it("empty string [without tab stop]", () => {
        const el = getBindingElements(context).find(
          (i) => i.name === "path"
        ) as BindingInfoElement;
        const result = typesToValue({
          types: el.type,
          context: {
            doubleQuotes: false,
          } as BindContext,
        });
        expect(result).toStrictEqual(['""']);
      });
    });
    describe('type.kind === "boolean"', () => {
      it("type.collection && collectionValue === false", () => {
        let el = getBindingElements(context).find(
          (i) => i.name === "suspended"
        ) as BindingInfoElement;
        // for test - set collection as true
        el = { ...el, type: [{ ...el.type[0], collection: true }] };
        const result = typesToValue({
          types: el.type,
          context: { doubleQuotes: false } as BindContext,
          tabStop: 0,
          collectionValue: false,
        });
        expect(result).toStrictEqual(["[true, false]"]);
      });
      it("true false", () => {
        const el = getBindingElements(context).find(
          (i) => i.name === "suspended"
        ) as BindingInfoElement;
        const result = typesToValue({
          types: el.type,
          context: {
            doubleQuotes: false,
          } as BindContext,
        });
        expect(result).toStrictEqual(["true", "false"]);
      });
    });
    describe('type.kind === "integer" [forDiagnostic]', () => {
      it("type.collection && collectionValue === false", () => {
        let el = getBindingElements(context, aggregation).find(
          (i) => i.name === "startIndex"
        ) as BindingInfoElement;
        // for test - set collection as true
        el = { ...el, type: [{ ...el.type[0], collection: true }] };
        const result = typesToValue({
          types: el.type,
          context: { doubleQuotes: false } as BindContext,
          tabStop: 0,
          collectionValue: false,
          forDiagnostic: true,
        });
        expect(result).toStrictEqual(["collection of integer"]);
      });
      it("integer", () => {
        const el = getBindingElements(context, aggregation).find(
          (i) => i.name === "startIndex"
        ) as BindingInfoElement;
        const result = typesToValue({
          types: el.type,
          context: {
            doubleQuotes: false,
          } as BindContext,
          forDiagnostic: true,
        });
        expect(result).toStrictEqual(["integer"]);
      });
    });
    describe('type.kind === "object")', () => {
      it("type.collection && collectionValue === false [with tab stop]", () => {
        let el = getBindingElements(context).find(
          (i) => i.name === "formatOptions"
        ) as BindingInfoElement;
        // for test - set collection as true
        el = { ...el, type: [{ ...el.type[0], collection: true }] };
        const result = typesToValue({
          types: el.type,
          context: { doubleQuotes: false } as BindContext,
          tabStop: 0,
          collectionValue: false,
        });
        expect(result).toStrictEqual(["[{$0}]"]);
      });
      it("type.collection && collectionValue === false [without tab stop]", () => {
        let el = getBindingElements(context).find(
          (i) => i.name === "formatOptions"
        ) as BindingInfoElement;
        // for test - set collection as true
        el = { ...el, type: [{ ...el.type[0], collection: true }] };
        const result = typesToValue({
          types: el.type,
          context: { doubleQuotes: false } as BindContext,
          tabStop: undefined,
          collectionValue: false,
        });
        expect(result).toStrictEqual(["[{ }]"]);
      });
      it("{ } [with tab stop]", () => {
        const el = getBindingElements(context).find(
          (i) => i.name === "formatOptions"
        ) as BindingInfoElement;
        const result = typesToValue({
          types: el.type,
          context: {
            doubleQuotes: false,
          } as BindContext,
          tabStop: 0,
        });
        expect(result).toStrictEqual(["{$0}"]);
      });
      it("{ } [without tab stop]", () => {
        const el = getBindingElements(context).find(
          (i) => i.name === "formatOptions"
        ) as BindingInfoElement;
        const result = typesToValue({
          types: el.type,
          context: {
            doubleQuotes: false,
          } as BindContext,
        });
        expect(result).toStrictEqual(["{ }"]);
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

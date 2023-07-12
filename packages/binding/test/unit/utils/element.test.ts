import { findRange, typesToValue } from "../../../src/utils";
import { getPropertyBindingInfoElements } from "../../../src/definition/definition";
import { PropertyBindingInfoElement, BindContext } from "../../../src/types";
import { getContext } from "@ui5-language-assistant/context";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import { join } from "path";

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
        const el = getPropertyBindingInfoElements(context).find(
          (i) => i.name === "parts"
        ) as PropertyBindingInfoElement;
        const result = typesToValue(
          el.type,
          { doubleQuotes: false } as BindContext,
          undefined,
          false
        );
        expect(result).toStrictEqual(['[""]', "[{ }]"]);
      });
      it("type.collection && collectionValue === false) [with tab stop]", () => {
        const el = getPropertyBindingInfoElements(context).find(
          (i) => i.name === "parts"
        ) as PropertyBindingInfoElement;
        const result = typesToValue(
          el.type,
          { doubleQuotes: false } as BindContext,
          0,
          false
        );
        expect(result).toStrictEqual(['["$0"]', "[{$0}]"]);
      });
      it("empty string [with tab stop]", () => {
        const el = getPropertyBindingInfoElements(context).find(
          (i) => i.name === "path"
        ) as PropertyBindingInfoElement;
        const result = typesToValue(
          el.type,
          {
            doubleQuotes: false,
          } as BindContext,
          0
        );
        expect(result).toStrictEqual(['"$0"']);
      });
      it("empty string [without tab stop]", () => {
        const el = getPropertyBindingInfoElements(context).find(
          (i) => i.name === "path"
        ) as PropertyBindingInfoElement;
        const result = typesToValue(el.type, {
          doubleQuotes: false,
        } as BindContext);
        expect(result).toStrictEqual(['""']);
      });
    });
    describe('type.kind === "boolean"', () => {
      it("type.collection && collectionValue === false", () => {
        let el = getPropertyBindingInfoElements(context).find(
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
        const el = getPropertyBindingInfoElements(context).find(
          (i) => i.name === "suspended"
        ) as PropertyBindingInfoElement;
        const result = typesToValue(el.type, {
          doubleQuotes: false,
        } as BindContext);
        expect(result).toStrictEqual(["true", "false"]);
      });
    });
    describe('type.kind === "object")', () => {
      it("type.collection && collectionValue === false [with tab stop]", () => {
        let el = getPropertyBindingInfoElements(context).find(
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
      it("type.collection && collectionValue === false [without tab stop]", () => {
        let el = getPropertyBindingInfoElements(context).find(
          (i) => i.name === "formatOptions"
        ) as PropertyBindingInfoElement;
        // for test - set collection as true
        el = { ...el, type: [{ ...el.type[0], collection: true }] };
        const result = typesToValue(
          el.type,
          { doubleQuotes: false } as BindContext,
          undefined,
          false
        );
        expect(result).toStrictEqual(["[{ }]"]);
      });
      it("{ } [with tab stop]", () => {
        const el = getPropertyBindingInfoElements(context).find(
          (i) => i.name === "formatOptions"
        ) as PropertyBindingInfoElement;
        const result = typesToValue(
          el.type,
          {
            doubleQuotes: false,
          } as BindContext,
          0
        );
        expect(result).toStrictEqual(["{$0}"]);
      });
      it("{ } [without tab stop]", () => {
        const el = getPropertyBindingInfoElements(context).find(
          (i) => i.name === "formatOptions"
        ) as PropertyBindingInfoElement;
        const result = typesToValue(el.type, {
          doubleQuotes: false,
        } as BindContext);
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

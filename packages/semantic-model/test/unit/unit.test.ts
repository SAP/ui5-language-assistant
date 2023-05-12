import { forEach, isPlainObject, keys } from "lodash";
import {
  buildUI5Model,
  buildUI5Class,
  expectExists,
} from "@ui5-language-assistant/test-utils";
import {
  UI5Class,
  UI5SemanticModel,
  UI5Type,
} from "@ui5-language-assistant/semantic-model-types";
import { resolveType, setParent } from "../../src/resolve";
import { getSymbolMaps } from "../../src/utils";
import { generate } from "../../src/api";
import { ClassSymbol, NamespaceSymbol, SymbolBase } from "../../src/api-json";
import { addViewDefaultAggregation } from "../../src/fix-api-json";

describe("The ui5-language-assistant semantic model package unit tests", () => {
  describe("resolveType", () => {
    it("returns the same type if it's resolved", () => {
      const model = buildUI5Model({});
      const stringPrimitiveType: UI5Type = {
        kind: "PrimitiveType",
        name: "String",
      };
      expect(
        resolveType({
          model,
          type: stringPrimitiveType,
          typeNameFix: {},
          strict: true,
        })
      ).toEqual(stringPrimitiveType);
    });
  });

  describe("setParent", () => {
    it("fails when parent is not found in the model", () => {
      const model = buildUI5Model({});
      const classFqn = "sap.MyClass";
      const classs = buildUI5Class({
        name: "MyClass",
      });
      model.classes[classFqn] = classs;

      expect(() => {
        setParent(model, classFqn, classs);
      }).toThrow("Symbol sap not found");
    });
  });

  describe("getSymbolMaps", () => {
    it("returns all object properties on the model", () => {
      const model = buildUI5Model({});
      const objectsOnModel: unknown[] = [];

      // Get all plain objects in the model and check that getSymbolMaps returns them
      // This is done to ensure we didn't forget any symbol maps. If a map/object is added that should
      // be ignored in getSymbolMaps this loop should be updated to ignore it.
      forEach(model, (property) => {
        if (isPlainObject(property)) {
          objectsOnModel.push(property);
        }
      });

      expect(getSymbolMaps(model)).toIncludeAllMembers(objectsOnModel);
    });
  });

  describe("generate", () => {
    function generateSymbol(symbol: SymbolBase): UI5SemanticModel {
      return generate({
        version: "1.71.49",
        strict: true,
        typeNameFix: {},
        libraries: {
          testLib: {
            "$schema-ref":
              "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
            symbols: [symbol],
          },
        },
      });
    }

    function generateAndVerifyClass(
      partialClass: Partial<ClassSymbol>
    ): UI5Class {
      const symbol = {
        kind: "class",
        basename: "rootSymbol",
        name: "rootSymbol",
        ...partialClass,
      } as ClassSymbol; // Casting is required because typescript compiler expects constructor to be a function
      const result = generateSymbol(symbol);
      expect(keys(result.classes)).toInclude("rootSymbol");
      return result.classes["rootSymbol"];
    }

    it("sets public visibility on constructor if visibility is not defined", () => {
      const result = generateAndVerifyClass({
        constructor: {
          description: "constructor with undefined visibility",
        },
      } as Partial<ClassSymbol>); // Casting is necessary because typescript compiler expects constructor to be a function
      expectExists(result.ctor, "constructor");
      expect(result.ctor.visibility).toEqual("public");
    });

    it("sets public visibility on event if visibility is not defined", () => {
      const result = generateAndVerifyClass({
        events: [
          {
            name: "name",
          },
        ],
      });
      expect(result.events).toHaveLength(1);
      expect(result.events[0].visibility).toEqual("public");
    });

    it("doesn't set type when not defined on class property", () => {
      const result = generateAndVerifyClass({
        "ui5-metadata": {
          properties: [
            {
              name: "name",
            },
          ],
        },
      });
      expect(result.properties).toHaveLength(1);
      expect(result.properties[0].type).toBeUndefined();
    });

    it("doesn't set type when not defined on class aggregation", () => {
      const result = generateAndVerifyClass({
        "ui5-metadata": {
          aggregations: [
            {
              name: "name",
            },
          ],
        },
      });
      expect(result.aggregations).toHaveLength(1);
      expect(result.aggregations[0].type).toBeUndefined();
    });

    it("sets cardinality to 0..n when not defined on class aggregation", () => {
      const result = generateAndVerifyClass({
        "ui5-metadata": {
          aggregations: [
            {
              name: "name",
            },
          ],
        },
      });
      expect(result.aggregations).toHaveLength(1);
      expect(result.aggregations[0].cardinality).toEqual("0..n");
    });

    it("doesn't set type when not defined on class association", () => {
      const result = generateAndVerifyClass({
        "ui5-metadata": {
          associations: [
            {
              name: "name",
            },
          ],
        },
      });
      expect(result.associations).toHaveLength(1);
      expect(result.associations[0].type).toBeUndefined();
    });

    it("sets cardinality to 0..1 when not defined on class association", () => {
      const result = generateAndVerifyClass({
        "ui5-metadata": {
          associations: [
            {
              name: "name",
            },
          ],
        },
      });
      expect(result.associations).toHaveLength(1);
      expect(result.associations[0].cardinality).toEqual("0..1");
    });

    it("doesn't set type when not defined on namespace field", () => {
      const symbol: NamespaceSymbol = {
        kind: "namespace",
        basename: "rootNamespace",
        name: "rootNamespace",
        properties: [
          {
            name: "myField",
          },
        ],
      };
      const result = generateSymbol(symbol);
      expect(keys(result.namespaces)).toInclude("rootNamespace");
      const namespace = result.namespaces["rootNamespace"];
      expect(namespace.fields).toHaveLength(1);
      expect(namespace.fields[0].type).toBeUndefined();
    });

    describe("symbols is undefined", () => {
      const fileContent = {
        "$schema-ref": "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
        version: "1.71.49",
        library: "testLib",
      };

      it("doesn't fail in strict mode", () => {
        const model = generate({
          version: fileContent.version,
          libraries: { testLib: fileContent },
          typeNameFix: {},
          strict: true,
        });
        expectExists(model, "model");
      });

      it("doesn't fail in non-strict mode", () => {
        const model = generate({
          version: fileContent.version,
          libraries: { testLib: fileContent },
          typeNameFix: {},
          strict: false,
        });
        expectExists(model, "model");
      });
    });
  });

  describe("includedLibraries", () => {
    function generateFromLibraries(
      libraries: Record<string, unknown>
    ): UI5SemanticModel {
      const result = generate({
        version: "1.71.49",
        strict: false,
        typeNameFix: {},
        libraries: libraries,
        printValidationErrors: false,
      });
      return result;
    }

    const libWithSymbol = {
      "$schema-ref": "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
      symbols: [
        {
          kind: "class",
          basename: "rootSymbol",
          name: "rootSymbol",
        },
      ],
    };

    it("contains a valid library", () => {
      const result = generateFromLibraries({
        testLib: libWithSymbol,
      });
      expect(result.includedLibraries).toStrictEqual(["testLib"]);
    });

    it("contains an invalid library object", () => {
      const result = generateFromLibraries({
        testLib: {},
      });
      expect(result.includedLibraries).toStrictEqual(["testLib"]);
    });

    it("contains an empty library", () => {
      const result = generateFromLibraries({
        testLib: "",
      });
      expect(result.includedLibraries).toStrictEqual(["testLib"]);
    });

    it("contains all sent libraries", () => {
      const result = generateFromLibraries({
        testLib: libWithSymbol,
        lib2: libWithSymbol,
        emptyLib: {},
      });
      expect(result.includedLibraries).toIncludeSameMembers([
        "testLib",
        "lib2",
        "emptyLib",
      ]);
    });
  });

  describe("API JSON fixes", () => {
    describe("addViewDefaultAggregation", () => {
      it("doesn't fail when there is a sap.ui.core.mvc.View with no ui5-metadata", () => {
        addViewDefaultAggregation("sap.ui.core", {
          symbols: [
            {
              name: "sap.ui.core.mvc.View",
            },
          ],
        });
      });
    });
  });
});

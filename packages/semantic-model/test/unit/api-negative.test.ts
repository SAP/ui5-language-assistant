import { keys } from "lodash";
import { expectExists } from "@ui5-language-assistant/test-utils";
import {
  UI5SemanticModel,
  UnresolvedType,
} from "@ui5-language-assistant/semantic-model-types";
import { forEachSymbol } from "../../src/utils";
import { generate } from "../../src/api";

describe("The ui5-language-assistant semantic model package API negative tests", () => {
  describe("generate from model with invalid library file", () => {
    const message = "not a valid library file";

    function getGenerateCall(
      fileContent: unknown,
      strict: boolean
    ): () => UI5SemanticModel {
      const generateCall = (): UI5SemanticModel => {
        return generate({
          version: "1.71.60",
          libraries: {
            validLib: {
              "$schema-ref":
                "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
              version: "1.71.60",
              library: "validLib",
              symbols: [
                {
                  kind: "namespace",
                  name: "sap.valid",
                  basename: "valid",
                  resource: "resource.js",
                  module: "resource",
                  static: true,
                  visibility: "public",
                  description: "Test Namespace",
                },
              ],
            },
            invalidLib: fileContent,
          },
          strict: strict,
          typeNameFix: {},
          printValidationErrors: false,
        });
      };
      return generateCall;
    }

    const validSymbolFromInvalidLib = {
      kind: "namespace",
      name: "sap.validNS",
      basename: "validNS",
      resource: "resource.js",
      module: "resource",
      static: true,
      visibility: "public",
      description: "Test Namespace from invalidLib",
    };

    function assertGenerateThrowsInStrictMode(
      fileContent: unknown,
      message: string
    ): void {
      expect(getGenerateCall(fileContent, true)).toThrow(message);
    }

    function assertGenerateDoesntThrowInNonStrictMode(
      fileContent: unknown
    ): UI5SemanticModel {
      const generateCall = getGenerateCall(fileContent, false);
      return generateCall();
    }
    function assertGeneratedModel(
      model: UI5SemanticModel,
      onlyValidLibSymbols: boolean
    ): void {
      const validLibNamespaces = ["sap.valid", "sap"];
      const invalidLibValidNamespaces = ["sap.validNS"];
      expect(model).not.toBeUndefined();
      expect(model.version).toEqual("1.71.60");
      expect(keys(model.namespaces)).toIncludeAllMembers(validLibNamespaces);

      if (onlyValidLibSymbols) {
        expect(model.classes).toBeEmpty();
        expect(model.interfaces).toBeEmpty();
        expect(model.enums).toBeEmpty();
        expect(model.typedefs).toBeEmpty();
        expect(model.functions).toBeEmpty();
        expect(keys(model.namespaces)).toHaveLength(validLibNamespaces.length);
      } else {
        expect(keys(model.namespaces)).toIncludeAllMembers(
          invalidLibValidNamespaces
        );
      }
    }

    describe("file content is not an object", () => {
      it("fails in strict mode", () => {
        assertGenerateThrowsInStrictMode("not an object", message);
      });

      it("doesn't fail in non-strict mode", () => {
        const model = assertGenerateDoesntThrowInNonStrictMode("not an object");
        assertGeneratedModel(model, true);
      });
    });

    describe("$schema-ref is not a string", () => {
      const fileContent = {
        "$schema-ref": 123,
        version: "1.71.60",
        library: "invalidLib",
        symbols: [validSymbolFromInvalidLib],
      };

      it("fails in strict mode", () => {
        assertGenerateThrowsInStrictMode(fileContent, message);
      });

      it("doesn't fail and adds symbols in non-strict mode", () => {
        const model = assertGenerateDoesntThrowInNonStrictMode(fileContent);
        assertGeneratedModel(model, false);
      });
    });

    describe("version is not a string", () => {
      const fileContent = {
        "$schema-ref": "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
        version: 123,
        library: "invalidLib",
        symbols: [validSymbolFromInvalidLib],
      };

      it("fails in strict mode", () => {
        assertGenerateThrowsInStrictMode(fileContent, message);
      });

      it("doesn't fail and adds symbols in non-strict mode", () => {
        const model = assertGenerateDoesntThrowInNonStrictMode(fileContent);
        assertGeneratedModel(model, false);
      });
    });

    describe("library is not a string or undefined", () => {
      const fileContent = {
        "$schema-ref": "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
        version: "1.71.60",
        library: 123,
        symbols: [validSymbolFromInvalidLib],
      };

      it("fails in strict mode", () => {
        assertGenerateThrowsInStrictMode(fileContent, message);
      });

      it("doesn't fail and adds symbols in non-strict mode", () => {
        const model = assertGenerateDoesntThrowInNonStrictMode(fileContent);
        assertGeneratedModel(model, false);
      });
    });

    describe("symbols is not an array", () => {
      const fileContent = {
        "$schema-ref": "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
        version: "1.71.60",
        library: "invalidLib",
        symbols: 123,
      };

      it("fails in strict mode", () => {
        assertGenerateThrowsInStrictMode(fileContent, message);
      });

      it("doesn't fail in non-strict mode", () => {
        const model = assertGenerateDoesntThrowInNonStrictMode(fileContent);
        assertGeneratedModel(model, true);
      });
    });

    describe("symbol with unknown kind exists", () => {
      const fileContent = {
        "$schema-ref": "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
        version: "1.71.60",
        library: "invalidLib",
        symbols: [
          validSymbolFromInvalidLib,
          {
            kind: "not_a_namespace",
            name: "sap.invalidNS",
            basename: "invalidNS",
            resource: "resource.js",
            module: "resource",
            static: true,
            visibility: "public",
            description: "Test bad symbol from invalidLib",
          },
        ],
      };

      it("fails in strict mode", () => {
        assertGenerateThrowsInStrictMode(fileContent, message);
      });

      it("doesn't fail but doesn't add the bad symbol in non-strict mode", () => {
        const model = assertGenerateDoesntThrowInNonStrictMode(fileContent);
        assertGeneratedModel(model, false);
        forEachSymbol(model, (symbol, key) => {
          expect(key).not.toEqual("sap.invalidSymbol");
        });
      });
    });

    describe("symbol with bad property types", () => {
      describe("non-string string property", () => {
        describe("on the symbol", () => {
          const fileContent = {
            "$schema-ref":
              "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
            version: "1.71.60",
            library: "invalidLib",
            symbols: [
              validSymbolFromInvalidLib,
              {
                kind: "class",
                name: "sap.validNS.invalidSymbol",
                basename: "invalidSymbol",
                resource: "resource.js",
                module: "resource",
                visibility: "public",
                description: "Test bad class from invalidLib",
                extends: 123,
              },
            ],
          };

          it("fails in strict mode", () => {
            assertGenerateThrowsInStrictMode(fileContent, message);
          });

          it("doesn't fail and adds the symbol in non-strict mode", () => {
            const model = assertGenerateDoesntThrowInNonStrictMode(fileContent);
            assertGeneratedModel(model, false);
            expect(keys(model.classes)).toInclude("sap.validNS.invalidSymbol");
          });
        });
        describe("on a symbol property", () => {
          const fileContent = {
            "$schema-ref":
              "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
            version: "1.71.60",
            library: "invalidLib",
            symbols: [
              validSymbolFromInvalidLib,
              {
                kind: "class",
                name: "sap.validNS.invalidSymbol",
                basename: "invalidSymbol",
                resource: "resource.js",
                module: "resource",
                visibility: "public",
                description: "Test bad class from invalidLib",
                deprecated: {
                  since: [],
                },
              },
            ],
          };

          it("fails in strict mode", () => {
            assertGenerateThrowsInStrictMode(fileContent, message);
          });

          it("doesn't fail and adds the symbol in non-strict mode", () => {
            const model = assertGenerateDoesntThrowInNonStrictMode(fileContent);
            assertGeneratedModel(model, false);
            expect(keys(model.classes)).toInclude("sap.validNS.invalidSymbol");
          });
        });
        describe("in an array", () => {
          const fileContent = {
            "$schema-ref":
              "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
            version: "1.71.60",
            library: "invalidLib",
            symbols: [
              validSymbolFromInvalidLib,
              {
                kind: "class",
                name: "sap.validNS.invalidSymbol",
                basename: "invalidSymbol",
                resource: "resource.js",
                module: "resource",
                visibility: "public",
                description: "Test bad class from invalidLib",
                implements: [true],
              },
            ],
          };

          it("fails in strict mode", () => {
            assertGenerateThrowsInStrictMode(fileContent, message);
          });

          it("doesn't fail and adds the symbol in non-strict mode", () => {
            const model = assertGenerateDoesntThrowInNonStrictMode(fileContent);
            assertGeneratedModel(model, false);
            expect(keys(model.classes)).toInclude("sap.validNS.invalidSymbol");
          });
        });
      });
      describe("non-array array property", () => {
        describe("on the symbol", () => {
          const fileContent = {
            "$schema-ref":
              "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
            version: "1.71.60",
            library: "invalidLib",
            symbols: [
              validSymbolFromInvalidLib,
              {
                kind: "class",
                name: "sap.validNS.invalidSymbol",
                basename: "invalidSymbol",
                resource: "resource.js",
                module: "resource",
                visibility: "public",
                description: "Test bad class from invalidLib",
                implements: "abc",
              },
            ],
          };

          it("fails in strict mode", () => {
            assertGenerateThrowsInStrictMode(fileContent, message);
          });

          it("doesn't fail and adds the symbol in non-strict mode", () => {
            const model = assertGenerateDoesntThrowInNonStrictMode(fileContent);
            assertGeneratedModel(model, false);
            expect(keys(model.classes)).toInclude("sap.validNS.invalidSymbol");
          });
        });
        describe("on a symbol property", () => {
          const fileContent = {
            "$schema-ref":
              "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
            version: "1.71.60",
            library: "invalidLib",
            symbols: [
              validSymbolFromInvalidLib,
              {
                kind: "class",
                name: "sap.validNS.invalidSymbol",
                basename: "invalidSymbol",
                resource: "resource.js",
                module: "resource",
                visibility: "public",
                description: "Test bad class from invalidLib",
                "ui5-metadata": {
                  events: 123,
                },
              },
            ],
          };

          it("fails in strict mode", () => {
            assertGenerateThrowsInStrictMode(fileContent, message);
          });

          it("doesn't fail and adds the symbol in non-strict mode", () => {
            const model = assertGenerateDoesntThrowInNonStrictMode(fileContent);
            assertGeneratedModel(model, false);
            expect(keys(model.classes)).toInclude("sap.validNS.invalidSymbol");
          });
        });
        describe("in an array", () => {
          const fileContent = {
            "$schema-ref":
              "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
            version: "1.71.60",
            library: "invalidLib",
            symbols: [
              validSymbolFromInvalidLib,
              {
                kind: "class",
                name: "sap.validNS.invalidSymbol",
                basename: "invalidSymbol",
                resource: "resource.js",
                module: "resource",
                visibility: "public",
                description: "Test bad class from invalidLib",
                events: [
                  {
                    parameters: "abc",
                  },
                ],
              },
            ],
          };

          it("fails in strict mode", () => {
            assertGenerateThrowsInStrictMode(fileContent, message);
          });

          it("doesn't fail and adds the symbol in non-strict mode", () => {
            const model = assertGenerateDoesntThrowInNonStrictMode(fileContent);
            assertGeneratedModel(model, false);
            expect(keys(model.classes)).toInclude("sap.validNS.invalidSymbol");
          });
        });
      });
      describe("non-object object property", () => {
        describe("on the symbol", () => {
          const fileContent = {
            "$schema-ref":
              "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
            version: "1.71.60",
            library: "invalidLib",
            symbols: [
              validSymbolFromInvalidLib,
              {
                kind: "class",
                name: "sap.validNS.invalidSymbol",
                basename: "invalidSymbol",
                resource: "resource.js",
                module: "resource",
                visibility: "public",
                description: "Test bad class from invalidLib",
                deprecated: true,
              },
            ],
          };

          it("fails in strict mode", () => {
            assertGenerateThrowsInStrictMode(fileContent, message);
          });

          it("doesn't fail and adds the symbol in non-strict mode", () => {
            const model = assertGenerateDoesntThrowInNonStrictMode(fileContent);
            assertGeneratedModel(model, false);
            expect(keys(model.classes)).toInclude("sap.validNS.invalidSymbol");
          });
        });
        describe("on a symbol property", () => {
          const fileContent = {
            "$schema-ref":
              "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
            version: "1.71.60",
            library: "invalidLib",
            symbols: [
              validSymbolFromInvalidLib,
              {
                kind: "class",
                name: "sap.validNS.invalidSymbol",
                basename: "invalidSymbol",
                resource: "resource.js",
                module: "resource",
                visibility: "public",
                description: "Test bad class from invalidLib",
                "ui5-metadata": {
                  dnd: "abc",
                },
              },
            ],
          };

          it("fails in strict mode", () => {
            assertGenerateThrowsInStrictMode(fileContent, message);
          });

          it("doesn't fail and adds the symbol in non-strict mode", () => {
            const model = assertGenerateDoesntThrowInNonStrictMode(fileContent);
            assertGeneratedModel(model, false);
            expect(keys(model.classes)).toInclude("sap.validNS.invalidSymbol");
          });
        });
        describe("in an array", () => {
          const fileContent = {
            "$schema-ref":
              "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
            version: "1.71.60",
            library: "invalidLib",
            symbols: [
              validSymbolFromInvalidLib,
              {
                kind: "class",
                name: "sap.validNS.invalidSymbol",
                basename: "invalidSymbol",
                resource: "resource.js",
                module: "resource",
                visibility: "public",
                description: "Test bad class from invalidLib",
                events: [123],
              },
            ],
          };

          it("fails in strict mode", () => {
            assertGenerateThrowsInStrictMode(fileContent, message);
          });

          it("doesn't fail and adds the symbol in non-strict mode", () => {
            const model = assertGenerateDoesntThrowInNonStrictMode(fileContent);
            assertGeneratedModel(model, false);
            expect(keys(model.classes)).toInclude("sap.validNS.invalidSymbol");
          });
        });
      });
    });

    describe("symbol with unexpected properties", () => {
      describe("on the symbol", () => {
        const fileContent = {
          "$schema-ref":
            "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
          version: "1.71.60",
          library: "invalidLib",
          symbols: [
            validSymbolFromInvalidLib,
            {
              kind: "class",
              name: "sap.validNS.invalidSymbol",
              basename: "invalidSymbol",
              resource: "resource.js",
              module: "resource",
              visibility: "public",
              description: "Test bad class from invalidLib",
              "my-property": "my-value",
            },
          ],
        };

        it("fails in strict mode", () => {
          assertGenerateThrowsInStrictMode(fileContent, message);
        });

        it("doesn't fail and adds the symbol in non-strict mode", () => {
          const model = assertGenerateDoesntThrowInNonStrictMode(fileContent);
          assertGeneratedModel(model, false);
          expect(keys(model.classes)).toInclude("sap.validNS.invalidSymbol");
        });
      });
      describe("on a symbol property", () => {
        const fileContent = {
          "$schema-ref":
            "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
          version: "1.71.60",
          library: "invalidLib",
          symbols: [
            validSymbolFromInvalidLib,
            {
              kind: "class",
              name: "sap.validNS.invalidSymbol",
              basename: "invalidSymbol",
              resource: "resource.js",
              module: "resource",
              visibility: "public",
              description: "Test bad class from invalidLib",
              "ui5-metadata": {
                "my-property": "my-value",
              },
            },
          ],
        };

        it("fails in strict mode", () => {
          assertGenerateThrowsInStrictMode(fileContent, message);
        });

        it("doesn't fail and adds the symbol in non-strict mode", () => {
          const model = assertGenerateDoesntThrowInNonStrictMode(fileContent);
          assertGeneratedModel(model, false);
          expect(keys(model.classes)).toInclude("sap.validNS.invalidSymbol");
        });
      });
      describe("in an array", () => {
        const fileContent = {
          "$schema-ref":
            "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
          version: "1.71.60",
          library: "invalidLib",
          symbols: [
            validSymbolFromInvalidLib,
            {
              kind: "class",
              name: "sap.validNS.invalidSymbol",
              basename: "invalidSymbol",
              resource: "resource.js",
              module: "resource",
              visibility: "public",
              description: "Test bad class from invalidLib",
              events: [
                {
                  "my-property": "my-value",
                },
              ],
            },
          ],
        };

        it("fails in strict mode", () => {
          assertGenerateThrowsInStrictMode(fileContent, message);
        });

        it("doesn't fail and adds the symbol in non-strict mode", () => {
          const model = assertGenerateDoesntThrowInNonStrictMode(fileContent);
          assertGeneratedModel(model, false);
          expect(keys(model.classes)).toInclude("sap.validNS.invalidSymbol");
        });
      });
    });
    describe("duplicate symbol", () => {
      const message = "Duplicate symbol found";
      describe("of the same kind", () => {
        const fileContent = {
          "$schema-ref":
            "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
          version: "1.71.60",
          library: "invalidLib",
          symbols: [
            validSymbolFromInvalidLib,
            {
              kind: "class",
              name: "sap.validNS.duplicateSymbol",
              basename: "duplicateSymbol",
              resource: "resource.js",
              module: "resource",
              visibility: "public",
              description:
                "Test duplicate symbol from invalidLib (first symbol)",
            },
            {
              kind: "class",
              name: "sap.validNS.duplicateSymbol",
              basename: "duplicateSymbol",
              resource: "resource.js",
              module: "resource",
              visibility: "public",
              description:
                "Test duplicate symbol from invalidLib (second symbol)",
            },
          ],
        };

        it("fails in strict mode", () => {
          assertGenerateThrowsInStrictMode(fileContent, message);
        });

        it("doesn't fail and adds the first symbol in non-strict mode", () => {
          const model = assertGenerateDoesntThrowInNonStrictMode(fileContent);
          assertGeneratedModel(model, false);
          expect(keys(model.classes)).toInclude("sap.validNS.duplicateSymbol");
          expect(
            model.classes["sap.validNS.duplicateSymbol"].description
          ).toInclude("(first symbol)");
        });
      });
      describe("of different kinds", () => {
        const fileContent = {
          "$schema-ref":
            "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
          version: "1.71.60",
          library: "invalidLib",
          symbols: [
            validSymbolFromInvalidLib,
            {
              kind: "class",
              name: "sap.validNS.duplicateSymbol",
              basename: "duplicateSymbol",
              resource: "resource.js",
              module: "resource",
              visibility: "public",
              description:
                "Test duplicate symbol from invalidLib (first symbol)",
            },
            {
              kind: "namespace",
              name: "sap.validNS.duplicateSymbol",
              basename: "duplicateSymbol",
              resource: "resource.js",
              module: "resource",
              visibility: "public",
              description:
                "Test duplicate symbol from invalidLib (second symbol)",
            },
          ],
        };

        it("fails in strict mode", () => {
          assertGenerateThrowsInStrictMode(fileContent, message);
        });

        it("doesn't fail and adds the first symbol in non-strict mode", () => {
          const model = assertGenerateDoesntThrowInNonStrictMode(fileContent);
          assertGeneratedModel(model, false);
          expect(keys(model.classes)).toInclude("sap.validNS.duplicateSymbol");
          expect(
            model.classes["sap.validNS.duplicateSymbol"].description
          ).toInclude("(first symbol)");
          expect(keys(model.namespaces)).not.toInclude(
            "sap.validNS.duplicateSymbol"
          );
        });
      });
    });

    describe("invalid extends for class", () => {
      const fileContent = {
        "$schema-ref": "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
        version: "1.71.60",
        library: "invalidLib",
        symbols: [
          validSymbolFromInvalidLib,
          {
            kind: "interface",
            name: "sap.validNS.MyInterface",
            basename: "MyInterface",
            resource: "resource.js",
            module: "resource",
            visibility: "public",
            description: "Test interface symbol from invalidLib",
          },
          {
            kind: "class",
            name: "sap.validNS.MyClass",
            basename: "MyClass",
            resource: "resource.js",
            module: "resource",
            visibility: "public",
            description: "Test class with interface extends from invalidLib",
            extends: "sap.validNS.MyInterface",
          },
        ],
      };

      it("fails in strict mode", () => {
        assertGenerateThrowsInStrictMode(
          fileContent,
          "sap.validNS.MyInterface is a UI5Interface and not a class"
        );
      });

      it("sets undefined extends in non-strict mode", () => {
        const model = assertGenerateDoesntThrowInNonStrictMode(fileContent);
        assertGeneratedModel(model, false);
        expect(keys(model.classes)).toInclude("sap.validNS.MyClass");
        expect(model.classes["sap.validNS.MyClass"].extends).toBeUndefined();
      });
    });

    describe("invalid implements for class", () => {
      const fileContent = {
        "$schema-ref": "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
        version: "1.71.60",
        library: "invalidLib",
        symbols: [
          validSymbolFromInvalidLib,
          {
            kind: "class",
            name: "sap.validNS.MyClass",
            basename: "MyClass",
            resource: "resource.js",
            module: "resource",
            visibility: "public",
            description: "Test class with class implements from invalidLib",
            implements: ["sap.validNS.MyOtherClass"],
          },
          {
            kind: "class",
            name: "sap.validNS.MyOtherClass",
            basename: "MyOtherClass",
            resource: "resource.js",
            module: "resource",
            visibility: "public",
            description: "Test class symbol from invalidLib",
          },
        ],
      };

      it("fails in strict mode", () => {
        assertGenerateThrowsInStrictMode(
          fileContent,
          "sap.validNS.MyOtherClass is a UI5Class and not an interface"
        );
      });

      it("doesn't add to implements array in non-strict mode", () => {
        const model = assertGenerateDoesntThrowInNonStrictMode(fileContent);
        assertGeneratedModel(model, false);
        expect(keys(model.classes)).toInclude("sap.validNS.MyClass");
        expect(model.classes["sap.validNS.MyClass"].implements).toBeEmpty();
      });
    });

    describe("invalid defaultAggregation for class", () => {
      const fileContent = {
        "$schema-ref": "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
        version: "1.71.60",
        library: "invalidLib",
        symbols: [
          validSymbolFromInvalidLib,
          {
            kind: "class",
            name: "sap.validNS.MyClass",
            basename: "MyClass",
            resource: "resource.js",
            module: "resource",
            visibility: "public",
            description:
              "Test class with bad defaultAggregation from invalidLib",
            "ui5-metadata": {
              aggregations: [],
              defaultAggregation: "nonExistingAggregation",
            },
          },
        ],
      };

      it("fails in strict mode", () => {
        assertGenerateThrowsInStrictMode(
          fileContent,
          "Unknown default aggregation"
        );
      });

      it("doesn't set the defaultAggregation in non-strict mode", () => {
        const model = assertGenerateDoesntThrowInNonStrictMode(fileContent);
        assertGeneratedModel(model, false);
        expect(keys(model.classes)).toInclude("sap.validNS.MyClass");
        expect(
          model.classes["sap.validNS.MyClass"].defaultAggregation
        ).toBeUndefined();
      });
    });

    describe("invalid type for class property", () => {
      const fileContent = {
        "$schema-ref": "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
        version: "1.71.60",
        library: "invalidLib",
        symbols: [
          validSymbolFromInvalidLib,
          {
            kind: "class",
            name: "sap.validNS.MyClass",
            basename: "MyClass",
            resource: "resource.js",
            module: "resource",
            visibility: "public",
            description:
              "Test class with invalid property type from invalidLib",
            "ui5-metadata": {
              properties: [
                {
                  name: "myProperty",
                  type: "non.existing.type",
                  visibility: "public",
                },
              ],
            },
          },
        ],
      };

      it("fails in strict mode", () => {
        assertGenerateThrowsInStrictMode(fileContent, "Unknown type");
      });

      it("sets UnresolvedType in non-strict mode", () => {
        const model = assertGenerateDoesntThrowInNonStrictMode(fileContent);
        assertGeneratedModel(model, false);
        expect(keys(model.classes)).toInclude("sap.validNS.MyClass");
        const properties = model.classes["sap.validNS.MyClass"].properties;
        expect(properties).toHaveLength(1);
        expectExists(properties[0], "property");
        expectExists(properties[0].type, "property type");
        expect(properties[0].type.kind).toEqual("UnresolvedType");
        expect((properties[0].type as UnresolvedType).name).toEqual(
          "non.existing.type"
        );
      });
    });
  });
});

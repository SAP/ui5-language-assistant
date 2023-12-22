import { forEach, isArray, includes, keys } from "lodash";
import {
  TestModelVersion,
  generateModel,
  expectProperty,
  expectExists,
  downloadLibraries,
} from "@ui5-language-assistant/test-utils";
import {
  UI5Framework,
  UI5SemanticModel,
  UI5Typedef,
} from "@ui5-language-assistant/semantic-model-types";
import { forEachSymbol } from "../../src/utils";
import { generate } from "../../src/api";
import {
  isObject,
  getFQN,
  expectModelObjectsEqual,
} from "./utils/model-test-utils";

describe("The ui5-language-assistant semantic model package API", () => {
  // Properties with these names are types
  const TYPE_PROPERTIES: string[] = ["type", "altTypes"];
  // Types of these kinds exist in other places in the model
  const RECURSIVE_TYPE_KINDS: string[] = [
    "UI5Class",
    "UI5Interface",
    "UI5Enum",
    "UI5Namespace",
    "UI5Typedef",
  ];

  // Object kind -> property names
  // Properties with these names on objects of these kinds exist in other places in the model
  const RECURSIVE_PROPERTIES: Record<string, string[]> = {
    UI5Namespace: ["namespaces", "classes"],
    UI5Class: ["extends", "implements"],
    "*": ["parent"],
  };
  // Properties with these names on objects of these kinds should not have their parents verified because they don't
  // have a parent or their parent is not the object that references them
  const PARENT_EXCLUDE_PROPERTIES: Record<string, string[]> = {
    UI5Class: ["extends", "implements"],
    UI5Prop: ["default"],
    "*": ["parent"].concat(TYPE_PROPERTIES),
  };
  function hasPropertyForKind(
    map: Record<string, string[]>,
    kind: string,
    propertyName: string
  ): boolean {
    return (
      includes(map[kind], propertyName) || includes(map["*"], propertyName)
    );
  }

  function assertRootSymbolsParent(model: UI5SemanticModel): void {
    forEachSymbol(model, (symbol, fqn) => {
      expectProperty(
        symbol,
        "parent",
        `Symbol ${fqn} does not have a parent property`
      );
      const parent = symbol.parent;
      if (fqn.indexOf(".") >= 0 && fqn.indexOf(".") !== fqn.length - 1) {
        expectExists(parent, `Symbol ${fqn} does not have a parent`);
        const parentFqn = getFQN(model, parent);
        expectExists(
          parentFqn,
          `Parent ${parent.kind} ${parent.name} of ${fqn} not found in the model`
        );
        expectProperty(
          symbol,
          "name",
          `Symbol ${fqn} does not have a name property`
        );
        expect(parentFqn + "." + symbol.name).toEqual(fqn);
      } else {
        expect(parent).toBeUndefined();
      }
    });
  }

  function assertSymbolPropertiesParent(model: UI5SemanticModel): void {
    // Top-level symbol parents are checked in assertRootSymbolsParent
    runOnValue(
      {
        value: model as unknown,
        fqn: "model",
        parent: undefined as unknown,
        deep: true,
      },
      function assertSymbolPropertiesParentInner(params) {
        const value = params.value;
        const kind = value.kind;
        const expectedParent = params.parent;
        const fqn = params.fqn;
        const deep = params.deep;

        if (expectedParent !== undefined) {
          expectProperty(
            value,
            "parent",
            `${fqn} does not have a parent property`
          );
          expect(value.parent).not.toBeUndefined();
          expectModelObjectsEqual(
            model,
            value.parent,
            expectedParent,
            `${fqn} has unexpected parent`
          );
        }

        if (!deep) {
          return;
        }

        forEach(value, (propertyValue, propertyName) => {
          if (
            hasPropertyForKind(PARENT_EXCLUDE_PROPERTIES, kind, propertyName)
          ) {
            return;
          }
          const isRecursiveProperty = hasPropertyForKind(
            RECURSIVE_PROPERTIES,
            kind,
            propertyName
          );
          runOnValue(
            {
              value: propertyValue,
              fqn: `${fqn}.${propertyName}`,
              parent: value,
              deep: !isRecursiveProperty,
            },
            assertSymbolPropertiesParentInner
          );
        });
      }
    );
  }

  function assertTypedefProperty(data: UI5Typedef | undefined) {
    if (!data) {
      return;
    }
    data.properties.forEach((prop) => {
      expect(prop.kind).toStrictEqual("UI5TypedefProp");
      expect(prop.name).toBeDefined();
      expect(prop.type).toBeDefined();
    });
  }

  type Params = {
    value: unknown;
    fqn: string;
  };
  type ObjectWithKind = Record<string, unknown> & { kind: string };

  /**
   * Run action on params.value if it's an object.
   * If the value is an array, run on every array element.
   * If the value is a map, run on each map value.
   * We consider objects without a kind property of type string to be maps.
   * @param params
   * @param action
   */
  function runOnValue<T extends Params>(
    params: T,
    action: (params: T & { value: ObjectWithKind }) => void
  ): void {
    const value = params.value;
    const fqn = params.fqn;
    if (isArray(value)) {
      for (let i = 0; i < value.length; ++i) {
        runOnValue(
          {
            ...params,
            value: value[i],
            fqn: `${fqn}[${i}]`,
          },
          action
        );
      }
    } else if (isObject(value)) {
      if ("kind" in value && typeof value.kind === "string") {
        if (value.kind !== "UI5TypedefProp") {
          action({
            ...params,
            value: value as ObjectWithKind,
          });
        }
      } else {
        // Map
        forEach(value, (mapValue, mapKey) => {
          runOnValue(
            {
              ...params,
              value: mapValue,
              fqn: `${fqn}[${mapKey}]`,
            },
            action
          );
        });
      }
    }
    // Non-object or array values aren't checked
  }

  function assertTypesAreResolved(model: UI5SemanticModel): void {
    runOnValue(
      { value: model as unknown, fqn: "model" },
      function assertTypesAreResolvedInner(params) {
        const fqn = params.fqn;
        const value = params.value;
        const kind = value.kind;
        forEach(value, (propertyValue, propertyName) => {
          runOnValue(
            { value: value[propertyName], fqn: `${fqn}.${propertyName}` },
            (params) => {
              if (includes(TYPE_PROPERTIES, propertyName)) {
                const type = params.value;
                expect(type.kind).not.toEqual("UnresolvedType");
                if (includes(RECURSIVE_TYPE_KINDS, type.kind)) {
                  return;
                }
              }
              if (
                hasPropertyForKind(RECURSIVE_PROPERTIES, kind, propertyName)
              ) {
                return;
              }
              runOnValue(
                { value: params.value, fqn: `${params.fqn}` },
                assertTypesAreResolvedInner
              );
            }
          );
        });
      }
    );
  }

  function createModelConsistencyTests(
    framework: UI5Framework,
    version: TestModelVersion
  ): void {
    describe(`Model generated from ${version}`, () => {
      beforeAll(async () => {
        await downloadLibraries(version);
      });

      it(`is created successfully in strict mode`, async () => {
        const model = await generateModel({
          framework,
          version,
          downloadLibs: false,
          modelGenerator: generate,
        });
        expect(model).not.toBeUndefined();
      });

      it(`is created successfully in non-strict mode`, async () => {
        const model = await generateModel({
          framework: framework,
          version,
          downloadLibs: false,
          strict: false,
          modelGenerator: generate,
        });
        expect(model).not.toBeUndefined();
      });

      describe("model consistency", () => {
        let model: UI5SemanticModel;
        beforeAll(async () => {
          model = await generateModel({
            framework: framework,
            version,
            downloadLibs: false,
            modelGenerator: generate,
          });
        });

        it(`has correct parent on root symbols`, async () => {
          assertRootSymbolsParent(model);
        });

        it(`has correct parent on symbols' properties`, async () => {
          assertSymbolPropertiesParent(model);
        });

        it(`has only resolved types`, async () => {
          assertTypesAreResolved(model);
        });
        it(`has typedef property [PropertyBindingInfo]`, async () => {
          assertTypedefProperty(
            model.typedefs["sap.ui.base.ManagedObject.PropertyBindingInfo"]
          );
        });
        // TODO: assert no cyclic references in extends or implements or parent - maybe not in a test
      });
    });
  }

  // TODO: old patches may be removed, should be updated continuously
  const versions: TestModelVersion[] = ["1.71.61", "1.84.41", "1.96.27"];
  for (const version of versions) {
    // TODO: consider also openui5?
    createModelConsistencyTests("SAPUI5", version);
  }

  describe("returned model is frozen", () => {
    const objectNotExtensibleMatcher =
      "Cannot add property myProperty, object is not extensible";
    let model: UI5SemanticModel;
    beforeAll(async () => {
      model = await generateModel({
        framework: "SAPUI5",
        version: "1.71.61",
        modelGenerator: generate,
      });
    });

    it("cannot change first-level member of the model", () => {
      expect(() => {
        model.namespaces = {};
      }).toThrowWithMessage(
        TypeError,
        "Cannot assign to read only property 'namespaces' of object '#<Object>'"
      );
    });

    it("cannot change property of internal member of the model", () => {
      const firstClass = model.classes[keys(model.classes)[0]];
      expect(firstClass).not.toBeUndefined();
      expect(firstClass.name).not.toBeUndefined();
      expect(() => {
        firstClass.name = "abc";
      }).toThrowWithMessage(
        TypeError,
        "Cannot assign to read only property 'name' of object '#<Object>'"
      );
    });

    it("cannot add first-level property on the model", () => {
      expect(() => {
        // Casting to any for testing purposes
        (model as any).myProperty = 1; // eslint-disable-line @typescript-eslint/no-explicit-any
      }).toThrowWithMessage(TypeError, objectNotExtensibleMatcher);
    });

    it("cannot add property on internal member of the model", () => {
      const firstClass = model.classes[keys(model.classes)[0]];
      expect(firstClass).not.toBeUndefined();
      expect(() => {
        // Casting to any for testing purposes
        (firstClass as any).myProperty = "abc"; // eslint-disable-line @typescript-eslint/no-explicit-any
      }).toThrowWithMessage(TypeError, objectNotExtensibleMatcher);
    });

    it("cannot remove first-level property from the model", () => {
      expect(() => {
        delete model["name" + "spaces"];
      }).toThrowWithMessage(
        TypeError,
        "Cannot delete property 'namespaces' of #<Object>"
      );
    });

    it("cannot remove property from internal member of the model", () => {
      const firstClass = model.classes[keys(model.classes)[0]];
      expect(firstClass).not.toBeUndefined();
      expect(firstClass.name).not.toBeUndefined();
      expect(() => {
        delete firstClass["na" + "me"];
      }).toThrowWithMessage(
        TypeError,
        "Cannot delete property 'name' of #<Object>"
      );
    });
  });

  describe("API JSON fixes", () => {
    let model: UI5SemanticModel;
    beforeAll(async () => {
      model = await generateModel({
        framework: "SAPUI5",
        version: "1.71.61",
        modelGenerator: generate,
      });
    });

    it("sets content as the default aggregation for sap.ui.core.mvc.View", () => {
      const view = model.classes["sap.ui.core.mvc.View"];
      expect(view).not.toBeUndefined();
      expectExists(view.defaultAggregation, "defaultAggregation");
      expect(view.defaultAggregation.name).toEqual("content");
    });
  });
});

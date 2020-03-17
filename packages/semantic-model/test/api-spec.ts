import { expect } from "chai";
import { forEach, isArray, includes, keys } from "lodash";
import {
  TestModelVersion,
  generateModel,
  expectProperty,
  expectExists,
  expectModelObjectsEqual,
  isObject,
  getFQN
} from "@ui5-editor-tools/test-utils";
import {
  UI5SemanticModel,
  UnresolvedType
} from "@ui5-editor-tools/semantic-model-types";
import { forEachSymbol } from "../src/utils";

context("The ui5-editor-tools semantic model package API", () => {
  // Properties with these names are types
  const TYPE_PROPERTIES: string[] = ["type", "altTypes"];
  // Types of these kinds exist in other places in the model
  const RECURSIVE_TYPE_KINDS: string[] = [
    "UI5Class",
    "UI5Interface",
    "UI5Enum",
    "UI5Namespace",
    "UI5Typedef"
  ];

  // Object kind -> property names
  // Properties with these names on objects of these kinds exist in other places in the model
  const RECURSIVE_PROPERTIES: Record<string, string[]> = {
    UI5Namespace: ["namespaces", "classes"],
    UI5Class: ["extends", "implements"],
    "*": ["parent"]
  };
  // Properties with these names on objects of these kinds should not have their parents verified because they don't
  // have a parent or their parent is not the object that references them
  const PARENT_EXCLUDE_PROPERTIES: Record<string, string[]> = {
    UI5Class: ["extends", "implements"],
    UI5Prop: ["default"],
    "*": ["parent"].concat(TYPE_PROPERTIES)
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
      if (fqn.indexOf(".") >= 0) {
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
        expect(parentFqn + "." + symbol.name).to.equal(fqn);
      } else {
        expect(parent, `Symbol ${fqn} has a parent`).to.be.undefined;
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
        deep: true
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
          expect(value.parent, `${fqn} does not have a parent`).to.exist;
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
              deep: !isRecursiveProperty
            },
            assertSymbolPropertiesParentInner
          );
        });
      }
    );
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
            fqn: `${fqn}[${i}]`
          },
          action
        );
      }
    } else if (isObject(value)) {
      if ("kind" in value && typeof value.kind === "string") {
        action({
          ...params,
          value: value as ObjectWithKind
        });
      } else {
        // Map
        forEach(value, (mapValue, mapKey) => {
          runOnValue(
            {
              ...params,
              value: mapValue,
              fqn: `${fqn}[${mapKey}]`
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
            params => {
              if (includes(TYPE_PROPERTIES, propertyName)) {
                const type = params.value;
                expect(
                  type.kind,
                  `Unresolved type ${
                    ((type as unknown) as UnresolvedType).name
                  } found in ${params.fqn}`
                ).to.not.equal("UnresolvedType");
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

  function createModelConsistencyTests(version: TestModelVersion): void {
    describe(`Model generated from ${version}`, () => {
      it(`is created successfully in strict mode`, () => {
        const model = generateModel(version);
        expect(model).to.exist;
      });
      it(`has correct parent on root symbols`, () => {
        const model = generateModel(version);
        assertRootSymbolsParent(model);
      });
      it(`has correct parent on symbols' properties`, () => {
        const model = generateModel(version);
        assertSymbolPropertiesParent(model);
      });
      it(`has only resolved types`, () => {
        const model = generateModel(version);
        assertTypesAreResolved(model);
      });
      // TODO: assert no cyclic references in extends or implements or parent - maybe not in a test
    });
  }

  const versions: TestModelVersion[] = ["1.60.14", "1.74.0"];
  for (const version of versions) {
    createModelConsistencyTests(version);
  }

  // CDN libraries (example URL):
  // https://sapui5-sapui5.dispatcher.us1.hana.ondemand.com/test-resources/sap/m/designtime/api.json

  describe("returned model is frozen", () => {
    const readOnlyMessageMatcher = "read only";
    const objectNotExtensibleMatcher = "not extensible";
    const cannotDeleteMatcher = "Cannot delete";
    let model: UI5SemanticModel;
    before(() => {
      model = generateModel("1.74.0");
    });

    it("cannot change first-level member of the model", () => {
      expect(() => {
        model.namespaces = {};
      }).to.throw(TypeError, readOnlyMessageMatcher);
    });

    it("cannot change property of internal member of the model", () => {
      const firstClass = model.classes[keys(model.classes)[0]];
      expect(firstClass).to.exist;
      expect(firstClass.name).to.exist;
      expect(() => {
        firstClass.name = "abc";
      }).to.throw(TypeError, readOnlyMessageMatcher);
    });

    it("cannot add first-level property on the model", () => {
      expect(() => {
        // Casting to any for testing purposes
        (model as any).myProperty = 1; // eslint-disable-line @typescript-eslint/no-explicit-any
      }).to.throw(TypeError, objectNotExtensibleMatcher);
    });

    it("cannot add property on internal member of the model", () => {
      const firstClass = model.classes[keys(model.classes)[0]];
      expect(firstClass).to.exist;
      expect(() => {
        // Casting to any for testing purposes
        (firstClass as any).myProperty = "abc"; // eslint-disable-line @typescript-eslint/no-explicit-any
      }).to.throw(TypeError, objectNotExtensibleMatcher);
    });

    it("cannot remove first-level property from the model", () => {
      expect(() => {
        delete model.namespaces;
      }).to.throw(TypeError, cannotDeleteMatcher);
    });

    it("cannot remove property from internal member of the model", () => {
      const firstClass = model.classes[keys(model.classes)[0]];
      expect(firstClass).to.exist;
      expect(firstClass.name).to.exist;
      expect(() => {
        delete firstClass.name;
      }).to.throw(TypeError, cannotDeleteMatcher);
    });
  });
});

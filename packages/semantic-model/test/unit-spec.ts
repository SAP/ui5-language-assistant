import { expect } from "chai";
import { forEach, isPlainObject } from "lodash";
import { buildUI5Model, buildUI5Class } from "@vscode-ui5/test-utils";
import { UI5Type } from "@vscode-ui5/semantic-model-types";
import { resolveType, setParent } from "../src/resolve";
import { getSymbolMaps } from "../src/utils";

context("The ui5-vscode semantic model package unit tests", () => {
  describe("resolveType", () => {
    it("returns the same type if it's resolved", () => {
      const model = buildUI5Model({});
      const stringPrimitiveType: UI5Type = {
        kind: "PrimitiveType",
        name: "String"
      };
      expect(
        resolveType({
          model,
          type: stringPrimitiveType,
          typeNameFix: {},
          strict: true
        })
      ).to.equal(stringPrimitiveType);
    });
  });

  describe("setParent", () => {
    it("fails when parent is not found in the model", () => {
      const model = buildUI5Model({});
      const classFqn = "sap.MyClass";
      const classs = buildUI5Class({
        name: "MyClass"
      });
      model.classes[classFqn] = classs;

      expect(() => {
        setParent(model, classFqn, classs);
      }).to.throw("Symbol sap not found");
    });
  });

  describe("getSymbolMaps", () => {
    it("returns all object properties on the model", () => {
      const model = buildUI5Model({});
      const objectsOnModel: unknown[] = [];

      // Get all plain objects in the model and check that getSymbolMaps returns them
      // This is done to ensure we didn't forget any symbol maps. If a map/object is added that should
      // be ignored in getSymbolMaps this loop should be updated to ignore it.
      forEach(model, property => {
        if (isPlainObject(property)) {
          objectsOnModel.push(property);
        }
      });

      expect(getSymbolMaps(model)).to.contain.members(objectsOnModel);
    });
  });
});

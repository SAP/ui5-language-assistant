import { expect } from "chai";
import {
  loadLibraries,
  getTypeNameFixForVersion,
  TestModelVersion,
  generateModel
} from "@vscode-ui5/test-utils";
import { generate } from "../src/api";
import { UI5SemanticModel } from "@vscode-ui5/semantic-model-types";

describe("The ui5-vscode semantic model package", () => {
  function createGenerationIt(version: TestModelVersion): void {
    it(`Generate from ${version}`, () => {
      const libToFileContent = loadLibraries(version);
      const model = generate({
        libraries: libToFileContent,
        typeNameFix: getTypeNameFixForVersion(version)
      });
      expect(model).to.exist;
    });
  }

  const versions: TestModelVersion[] = ["1.60.14", "1.74.0"];
  for (const version of versions) {
    createGenerationIt(version);
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
      const firstClass = model.classes[Object.keys(model.classes)[0]];
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
      const firstClass = model.classes[Object.keys(model.classes)[0]];
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
      const firstClass = model.classes[Object.keys(model.classes)[0]];
      expect(firstClass).to.exist;
      expect(firstClass.name).to.exist;
      expect(() => {
        delete firstClass.name;
      }).to.throw(TypeError, cannotDeleteMatcher);
    });
  });
});

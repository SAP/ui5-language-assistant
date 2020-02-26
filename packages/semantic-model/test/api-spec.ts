import { expect } from "chai";
import {
  loadLibraries,
  getTypeNameFixForVersion,
  TestModelVersion
} from "@vscode-ui5/test-utils";
import { generate } from "../src/api";

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
});

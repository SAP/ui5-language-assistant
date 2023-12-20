import {
  expectExists,
  generateModel,
} from "@ui5-language-assistant/test-utils";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { findSymbol, generate } from "../../src/api";
import { getFQN } from "./utils/model-test-utils";

describe("The semantic model utils", () => {
  let model: UI5SemanticModel;

  beforeAll(async () => {
    model = await generateModel({
      framework: "SAPUI5",
      version: "1.71.60",
      modelGenerator: generate,
    });
  });

  describe("findSymbols", () => {
    it("can locate a UI5 symbol in the model by FQN", () => {
      const button = findSymbol(model, "sap.m.Button");
      expectExists(button, "find symbol failed");
      expect(button.kind).toEqual("UI5Class");
      expect(getFQN(model, button)).toEqual("sap.m.Button");
    });
  });
});

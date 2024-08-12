import {
  expectExists,
  generateModel,
  getFallbackPatchVersions,
} from "@ui5-language-assistant/test-utils";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  DEFAULT_UI5_FRAMEWORK,
  DEFAULT_UI5_VERSION,
} from "@ui5-language-assistant/constant";
import { findSymbol, generate } from "../../src/api";
import { getFQN } from "./utils/model-test-utils";

describe("The semantic model utils", () => {
  let model: UI5SemanticModel;

  beforeAll(async () => {
    model = await generateModel({
      framework: DEFAULT_UI5_FRAMEWORK,
      version: (
        await getFallbackPatchVersions()
      ).SAPUI5 as typeof DEFAULT_UI5_VERSION,
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

import { expect } from "chai";
import {
  expectExists,
  generateModel,
} from "@ui5-language-assistant/test-utils";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { ui5NodeToFQN } from "@ui5-language-assistant/logic-utils";
import { findSymbol } from "../src/api";
import { generate } from "../api";

describe("The semantic model utils", () => {
  let model: UI5SemanticModel;

  before(async () => {
    model = await generateModel({
      version: "1.74.0",
      modelGenerator: generate,
    });
  });

  context("findSymbols", () => {
    it("can locate a UI5 symbol in the model by FQN", () => {
      const button = findSymbol(model, "sap.m.Button");
      expectExists(button, "find symbol failed");
      expect(button.kind).to.eql("UI5Class");
      expect(ui5NodeToFQN(button)).to.eql("Button");
    });
  });
});

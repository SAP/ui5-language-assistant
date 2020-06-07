import { expect } from "chai";
import {
  expectExists,
  generateModel,
} from "@ui5-language-assistant/test-utils";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";

import { findSymbol } from "../src/api";

describe("The semantic model utils", () => {
  let model: UI5SemanticModel;

  before(async () => {
    model = await generateModel({ version: "1.74.0" });
  });

  context("findSymbols", () => {
    it("can locate a UI5 symbol in the model by FQN", () => {
      const button = findSymbol(model, "sap.m.Button");
      expectExists(button, "find symbol failed");
      expect(button.kind).to.eql("UI5Class");
      // cannot use FQN utility here due to cyclic packages deps
      // TODO: fix cyclic packages deps (test-utils and semantic-model)
      expect(button.name).to.eql("Button");
    });
  });
});

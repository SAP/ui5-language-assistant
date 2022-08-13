import { expect } from "chai";
import {
  buildUI5Enum,
  generateModel,
} from "@ui5-language-assistant/test-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { getNodeDocumentation } from "../src/documentation";

describe("The @ui5-language-assistant/language-server <getNodeDocumentation> function", () => {
  let ui5SemanticModel: UI5SemanticModel;
  before(async function () {
    //TODO: use 1.71.x
    ui5SemanticModel = await generateModel({
      framework: "sapui5",
      version: "1.105.0",
      modelGenerator: generate,
    });
  });

  context("deprecatedInfo", () => {
    it("will get documentation with deprecatedInfo", () => {
      const ui5Enum = buildUI5Enum({
        name: "dummy-node",
        deprecatedInfo: {
          isDeprecated: true,
          since: "2.2.2",
          text: "dummy-text",
        },
      });
      const result = getNodeDocumentation(ui5Enum, ui5SemanticModel);
      expect(result.value).to.include(
        "Deprecated since version 2.2.2. dummy-text"
      );
    });
  });

  context("experimentalInfo", () => {
    it("will get documentation with experimentalInfo", () => {
      const ui5Enum = buildUI5Enum({
        name: "dummy-node",
        experimentalInfo: {
          isExperimental: true,
          since: "2.2.2",
          text: "dummyy-text",
        },
      });
      const result = getNodeDocumentation(ui5Enum, ui5SemanticModel);
      expect(result.value).to.include(
        "Experimental since version 2.2.2. dummyy-text"
      );
    });

    it("will get documentation with experimentalInfo - without since", () => {
      const ui5Enum = buildUI5Enum({
        name: "dummy-node",
        experimentalInfo: {
          isExperimental: true,
          since: undefined,
          text: "dummyy-text",
        },
      });
      const result = getNodeDocumentation(ui5Enum, ui5SemanticModel);
      expect(result.value).to.include("Experimental. dummyy-text");
      expect(result.value).to.not.include("since");
    });

    it("will get documentation with experimentalInfo - without text", () => {
      const ui5Enum = buildUI5Enum({
        name: "dummy-node",
        experimentalInfo: {
          isExperimental: true,
          since: "2.2.2",
          text: undefined,
        },
      });
      const result = getNodeDocumentation(ui5Enum, ui5SemanticModel);
      expect(result.value).to.include("Experimental since version 2.2.2.");
    });

    it("will get documentation with experimentalInfo - without since and text", () => {
      const ui5Enum = buildUI5Enum({
        name: "dummy-node",
        experimentalInfo: {
          isExperimental: true,
          since: undefined,
          text: undefined,
        },
      });
      const result = getNodeDocumentation(ui5Enum, ui5SemanticModel);
      expect(result.value).to.include("Experimental.");
    });
  });
});

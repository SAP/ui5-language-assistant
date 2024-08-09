import {
  buildUI5Enum,
  generateModel,
  getFallbackPatchVersions,
} from "@ui5-language-assistant/test-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { DEFAULT_UI5_VERSION } from "@ui5-language-assistant/constant";
import { getNodeDocumentation } from "../../src/documentation";

describe("The @ui5-language-assistant/language-server <getNodeDocumentation> function", () => {
  let ui5SemanticModel: UI5SemanticModel;
  beforeAll(async function () {
    ui5SemanticModel = await generateModel({
      framework: "SAPUI5",
      version: (
        await getFallbackPatchVersions()
      ).SAPUI5 as typeof DEFAULT_UI5_VERSION,
      modelGenerator: generate,
    });
  });

  describe("deprecatedInfo", () => {
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
      expect(result.value).toInclude(
        "Deprecated since version 2.2.2. dummy-text"
      );
    });
  });

  describe("experimentalInfo", () => {
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
      expect(result.value).toInclude(
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
      expect(result.value).toInclude("Experimental. dummyy-text");
      expect(result.value).not.toInclude("since");
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
      expect(result.value).toInclude("Experimental since version 2.2.2.");
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
      expect(result.value).toInclude("Experimental.");
    });
  });
});

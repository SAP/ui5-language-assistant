import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  DEFAULT_UI5_FRAMEWORK,
  DEFAULT_UI5_VERSION,
} from "@ui5-language-assistant/constant";
import { generate } from "@ui5-language-assistant/semantic-model";
import {
  generateModel,
  getFallbackPatchVersions,
} from "@ui5-language-assistant/test-utils";
import { validators } from "../../../../src/api";
import {
  computeExpectedRange,
  getDefaultContext,
  testValidationsScenario,
} from "../../test-utils";
import { Context as AppContext } from "@ui5-language-assistant/context";

describe("the use of deprecated class validation", () => {
  let ui5SemanticModel: UI5SemanticModel;
  let appContext: AppContext;
  beforeAll(async () => {
    ui5SemanticModel = await generateModel({
      framework: DEFAULT_UI5_FRAMEWORK,
      version: (
        await getFallbackPatchVersions()
      ).SAPUI5 as typeof DEFAULT_UI5_VERSION,
      modelGenerator: generate,
    });
    appContext = getDefaultContext(ui5SemanticModel);
  });

  describe("true positive scenarios", () => {
    it("will detect usage of a deprecated class", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
            <🢂Button🢀>
            </Button>
          </mvc:View>`;

      testValidationsScenario({
        context: appContext,
        xmlText: xmlSnippet,
        validators: {
          element: [validators.validateUseOfDeprecatedClass],
        },
        assertion: (issues) => {
          expect(issues).toHaveLength(1);

          expect(issues).toIncludeAllMembers([
            {
              issueType: "base",
              kind: "UseOfDeprecatedClass",
              message:
                "The sap.ui.commons.Button class is deprecated since version 1.38. replaced by sap.m.Button",
              severity: "warn",
              offsetRange: computeExpectedRange(xmlSnippet),
            },
          ]);
        },
      });
    });

    it("will detect usage of a deprecated class with self closing syntax", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
            <🢂Button🢀/>
          </mvc:View>`;

      testValidationsScenario({
        context: appContext,
        xmlText: xmlSnippet,
        validators: {
          element: [validators.validateUseOfDeprecatedClass],
        },
        assertion: (issues) => {
          expect(issues).toHaveLength(1);
          expect(issues).toIncludeAllMembers([
            {
              issueType: "base",
              kind: "UseOfDeprecatedClass",
              message:
                "The sap.ui.commons.Button class is deprecated since version 1.38. replaced by sap.m.Button",
              severity: "warn",
              offsetRange: computeExpectedRange(xmlSnippet),
            },
          ]);
        },
      });
    });

    it("will detect usage of a deprecated class in an unclosed element to enable **early warning** to users", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
            <🢂Button🢀
          </mvc:View>`;

      testValidationsScenario({
        context: appContext,
        xmlText: xmlSnippet,
        validators: {
          element: [validators.validateUseOfDeprecatedClass],
        },
        assertion: (issues) => {
          expect(issues).toHaveLength(1);

          expect(issues).toIncludeAllMembers([
            {
              issueType: "base",
              kind: "UseOfDeprecatedClass",
              message:
                "The sap.ui.commons.Button class is deprecated since version 1.38. replaced by sap.m.Button",
              severity: "warn",
              offsetRange: computeExpectedRange(xmlSnippet),
            },
          ]);
        },
      });
    });
  });

  describe("negative edge cases", () => {
    it("will not detect an issue when the class has not been deprecated", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
           <!-- unlike sap.ui.commons, sap.m is not deprecated -->
            xmlns="sap.m">
            <Button>
            </Button>
          </mvc:View>`;

      testValidationsScenario({
        context: appContext,
        xmlText: xmlSnippet,
        validators: {
          element: [validators.validateUseOfDeprecatedClass],
        },
        assertion: (issues) => {
          expect(issues).toBeEmpty();
        },
      });
    });

    it("will not detect an issue when xml tag is not a UI5 class", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
            <!-- An aggregation instead of a class -->
            <mvc:content>
            </mvc:content>
          </mvc:View>`;

      testValidationsScenario({
        context: appContext,
        xmlText: xmlSnippet,
        validators: {
          element: [validators.validateUseOfDeprecatedClass],
        },
        assertion: (issues) => {
          expect(issues).toBeEmpty();
        },
      });
    });
  });
});

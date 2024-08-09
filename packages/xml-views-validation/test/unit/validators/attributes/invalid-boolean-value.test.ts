import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { DEFAULT_UI5_VERSION } from "@ui5-language-assistant/constant";
import {
  generateModel,
  getFallbackPatchVersions,
} from "@ui5-language-assistant/test-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import { validators } from "../../../../src/api";
import {
  computeExpectedRange,
  getDefaultContext,
  testValidationsScenario,
} from "../../test-utils";
import { Context as AppContext } from "@ui5-language-assistant/context";

describe("the invalid boolean value validation", () => {
  let ui5SemanticModel: UI5SemanticModel;
  let appContext: AppContext;
  beforeAll(async () => {
    ui5SemanticModel = await generateModel({
      framework: "SAPUI5",
      version: (
        await getFallbackPatchVersions()
      ).SAPUI5 as typeof DEFAULT_UI5_VERSION,
      modelGenerator: generate,
    });
    appContext = getDefaultContext(ui5SemanticModel);
  });

  describe("true positive scenarios", () => {
    it("will detect an invalid boolean value", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            busy=🢂"untrue"🢀>
          </mvc:View>`;

      testValidationsScenario({
        context: appContext,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validators.validateBooleanValue],
        },
        assertion: (issues) => {
          expect(issues).toStrictEqual([
            {
              issueType: "base",
              kind: "InvalidBooleanValue",
              message:
                'Invalid boolean value: "untrue", expecting "true" or "false".',
              offsetRange: computeExpectedRange(xmlSnippet),
              severity: "error",
            },
          ]);
        },
      });
    });
  });

  describe("negative edge cases", () => {
    it("will not detect an issue when the boolean value is valid", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            busy="true">
          </mvc:View>`;

      testValidationsScenario({
        context: appContext,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validators.validateBooleanValue],
        },
        assertion: (issues) => {
          expect(issues).toBeEmpty();
        },
      });
    });

    it("will not detect an issue when the boolean value might be a binding expression", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            busy="{untrue}">
          </mvc:View>`;

      testValidationsScenario({
        context: appContext,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validators.validateBooleanValue],
        },
        assertion: (issues) => {
          expect(issues).toBeEmpty();
        },
      });
    });

    it("will not detect an issue when the enclosing tag is not a UI5 class", () => {
      const xmlSnippet = `
        <mvc:View1
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            busy="true">
        </mvc:View1>`;

      testValidationsScenario({
        context: appContext,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validators.validateBooleanValue],
        },
        assertion: (issues) => {
          expect(issues).toBeEmpty();
        },
      });
    });

    it("will not detect an issue when the expected type is not a boolean", () => {
      const xmlSnippet = `
        <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            busyIndicatorSize="untrue">
        </mvc:View>`;

      testValidationsScenario({
        context: appContext,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validators.validateBooleanValue],
        },
        assertion: (issues) => {
          expect(issues).toBeEmpty();
        },
      });
    });

    it("will not detect an issue when the attribute value does not exist", () => {
      const xmlSnippet = `
      <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m"
          busy=>
      </mvc:View>`;

      testValidationsScenario({
        context: appContext,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validators.validateBooleanValue],
        },
        assertion: (issues) => {
          expect(issues).toBeEmpty();
        },
      });
    });

    it("will not detect an issue when the attribute is part of a UI5 Class tag but not a recognized property ", () => {
      const xmlSnippet = `
        <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            busy1="untrue">
        </mvc:View>`;

      testValidationsScenario({
        context: appContext,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validators.validateBooleanValue],
        },
        assertion: (issues) => {
          expect(issues).toBeEmpty();
        },
      });
    });
  });
});

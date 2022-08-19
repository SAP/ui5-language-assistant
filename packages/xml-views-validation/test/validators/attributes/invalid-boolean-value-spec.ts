import { expect } from "chai";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { generateModel } from "@ui5-language-assistant/test-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import { validators } from "../../../src/api";
import {
  computeExpectedRange,
  testValidationsScenario,
} from "../../test-utils";

describe("the invalid boolean value validation", () => {
  let ui5SemanticModel: UI5SemanticModel;

  before(async () => {
    ui5SemanticModel = await generateModel({
      framework: "SAPUI5",
      version: "1.71.49",
      modelGenerator: generate,
    });
  });

  context("true positive scenarios", () => {
    it("will detect an invalid boolean value", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            busy=🢂"untrue"🢀>
          </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validators.validateBooleanValue],
        },
        assertion: (issues) => {
          expect(issues).to.deep.equal([
            {
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

  context("negative edge cases", () => {
    it("will not detect an issue when the boolean value is valid", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            busy="true">
          </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validators.validateBooleanValue],
        },
        assertion: (issues) => {
          expect(issues).to.be.empty;
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
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validators.validateBooleanValue],
        },
        assertion: (issues) => {
          expect(issues).to.be.empty;
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
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validators.validateBooleanValue],
        },
        assertion: (issues) => {
          expect(issues).to.be.empty;
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
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validators.validateBooleanValue],
        },
        assertion: (issues) => {
          expect(issues).to.be.empty;
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
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validators.validateBooleanValue],
        },
        assertion: (issues) => {
          expect(issues).to.be.empty;
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
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validators.validateBooleanValue],
        },
        assertion: (issues) => {
          expect(issues).to.be.empty;
        },
      });
    });
  });
});

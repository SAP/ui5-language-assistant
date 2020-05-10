import { expect } from "chai";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { generateModel } from "@ui5-language-assistant/test-utils";
import { testValidationsScenario } from "../../test-utils";
import { validateUnknownEnumValue } from "../../../src/validators/attributes/unknown-enum-value";

describe("the unknown enum value validation", () => {
  let ui5SemanticModel: UI5SemanticModel;

  before(async () => {
    ui5SemanticModel = await generateModel({ version: "1.74.0" });
  });

  context("true positive scenarios", () => {
    it("will detect an enum value that does not fit the expected type", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
            <List showSeparators = "TYPO💩">
            </List>
          </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validateUnknownEnumValue],
        },
        assertion: (issues) => {
          expect(issues).to.deep.equal([
            {
              kind: "UnknownEnumValue",
              message:
                'Unknown enum value: "TYPO💩", expecting one of: ["All", "Inner", "None"].',
              offsetRange: {
                start: 123,
                end: 130,
              },
              severity: "error",
            },
          ]);
        },
      });
    });
  });

  context("negative edge cases", () => {
    it("will not detect an issue when the enum value is valid", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
            <List showSeparators = "Inner">
            </List>
          </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validateUnknownEnumValue],
        },
        assertion: (issues) => {
          expect(issues).to.be.empty;
        },
      });
    });

    it("will not detect an issue when the enclosing tag is not a UI5 class", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
            <List_NOT_IN_UI5 showSeparators = "Inner">
            </List_NOT_IN_UI5>
          </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validateUnknownEnumValue],
        },
        assertion: (issues) => {
          expect(issues).to.be.empty;
        },
      });
    });

    it("will not detect an issue when the expected type is not a UI5 Enum", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
            <List blocked = "true">
            </List>
          </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validateUnknownEnumValue],
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
            xmlns="sap.m">
            <List showSeparators = >
            </List>
          </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validateUnknownEnumValue],
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
            xmlns="sap.m">
            <List NOT_A_VALID_PROPERTY💩 = "Inner" >
            </List>
          </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validateUnknownEnumValue],
        },
        assertion: (issues) => {
          expect(issues).to.be.empty;
        },
      });
    });
  });
});

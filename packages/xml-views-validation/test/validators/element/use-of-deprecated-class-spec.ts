import { expect } from "chai";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { generate } from "@ui5-language-assistant/semantic-model";
import { generateModel } from "@ui5-language-assistant/test-utils";
import { validators } from "../../../src/api";
import {
  computeExpectedRange,
  testValidationsScenario,
} from "../../test-utils";

describe("the use of deprecated class validation", () => {
  let ui5SemanticModel: UI5SemanticModel;

  before(async () => {
    ui5SemanticModel = await generateModel({
      framework: "sapui5",
      version: "1.105.0",
      modelGenerator: generate,
    });
  });

  context("true positive scenarios", () => {
    it("will detect usage of a deprecated class", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
            <🢂Button🢀>
            </Button>
          </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          element: [validators.validateUseOfDeprecatedClass],
        },
        assertion: (issues) => {
          expect(
            issues,
            "element tags names issues should be shown on both opening and closing name identifier"
          ).to.have.lengthOf(1);

          expect(issues).to.deep.include.members([
            {
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
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          element: [validators.validateUseOfDeprecatedClass],
        },
        assertion: (issues) => {
          expect(
            issues,
            "with a self closing tag an issue will only be shown for the opening tag."
          ).to.have.lengthOf(1);
          expect(issues).to.deep.include.members([
            {
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
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          element: [validators.validateUseOfDeprecatedClass],
        },
        assertion: (issues) => {
          expect(
            issues,
            "the element only has an OPEN tag, so only one issue would be shown"
          ).to.have.lengthOf(1);

          expect(issues).to.deep.include.members([
            {
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

  context("negative edge cases", () => {
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
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          element: [validators.validateUseOfDeprecatedClass],
        },
        assertion: (issues) => {
          expect(issues).to.be.empty;
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
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          element: [validators.validateUseOfDeprecatedClass],
        },
        assertion: (issues) => {
          expect(issues).to.be.empty;
        },
      });
    });
  });
});

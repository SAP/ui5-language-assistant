import { expect } from "chai";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  GEN_MODEL_TIMEOUT,
  generateModel
} from "@ui5-language-assistant/test-utils";
import { testValidationsScenario } from "../../test-utils";
import { validateUseOfDeprecatedClass } from "../../../src/validators/elements/use-of-deprecated-class";

describe("the use of deprecated class validation", () => {
  let ui5SemanticModel: UI5SemanticModel;

  before(async function() {
    this.timeout(GEN_MODEL_TIMEOUT);
    ui5SemanticModel = await generateModel({ version: "1.74.0" });
  });

  context("true positive scenarios", () => {
    it("will detect usage of a deprecated class", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
            <Button>
            </Button>
          </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          element: [validateUseOfDeprecatedClass]
        },
        assertion: issues => {
          expect(
            issues,
            "element tags names issues should be shown on both opening and closing name identifier"
          ).to.have.lengthOf(1);

          expect(issues).to.deep.include.members([
            {
              kind: "UseOfDeprecatedClass",
              message:
                "UI5 Class: sap.ui.commons.Button is deprecated since: 1.38.\n\treplaced by {@link sap.m.Button}.",
              severity: "warn",
              offsetRanges: [
                {
                  start: 110,
                  end: 115
                },
                {
                  start: 132,
                  end: 137
                }
              ]
            }
          ]);
        }
      });
    });

    it("will detect usage of a deprecated class with self closing syntax", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
            <Button/>
          </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          element: [validateUseOfDeprecatedClass]
        },
        assertion: issues => {
          expect(
            issues,
            "with a self closing tag an issue will only be shown for the opening tag."
          ).to.have.lengthOf(1);
          expect(issues).to.deep.include.members([
            {
              kind: "UseOfDeprecatedClass",
              message:
                "UI5 Class: sap.ui.commons.Button is deprecated since: 1.38.\n\treplaced by {@link sap.m.Button}.",
              severity: "warn",
              offsetRanges: [
                {
                  start: 110,
                  end: 115
                }
              ]
            }
          ]);
        }
      });
    });

    it("will detect usage of a deprecated class in an unclosed element to enable **early warning** to users", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
            <Button
          </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          element: [validateUseOfDeprecatedClass]
        },
        assertion: issues => {
          expect(
            issues,
            "the element only has an OPEN tag, so only one issue would be shown"
          ).to.have.lengthOf(1);

          expect(issues).to.deep.include.members([
            {
              kind: "UseOfDeprecatedClass",
              message:
                "UI5 Class: sap.ui.commons.Button is deprecated since: 1.38.\n\treplaced by {@link sap.m.Button}.",
              severity: "warn",
              offsetRanges: [
                {
                  start: 110,
                  end: 115
                }
              ]
            }
          ]);
        }
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
          element: [validateUseOfDeprecatedClass]
        },
        assertion: issues => {
          expect(issues).to.be.empty;
        }
      });
    });

    it("will not detect an issue when xml tag is not a UI5 class", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
            <!-- An aggregation instead of a class -->
            <content>
            </content>
          </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          element: [validateUseOfDeprecatedClass]
        },
        assertion: issues => {
          expect(issues).to.be.empty;
        }
      });
    });
  });
});

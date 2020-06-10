import { expect } from "chai";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  computeExpectedRange,
  testValidationsScenario,
} from "../../test-utils";
import { generateModel } from "@ui5-language-assistant/test-utils";
import { validateUseOfDeprecatedAggregation } from "../../../src/validators/elements/use-of-depracated-aggregation";

describe("the use of deprecated aggregation validation", () => {
  let ui5SemanticModel: UI5SemanticModel;

  before(async () => {
    ui5SemanticModel = await generateModel({ version: "1.74.0" });
  });

  context("true positive scenarios", () => {
    it("will detect usage of a deprecated aggregation", () => {
      const xmlSnippet = `       
            <mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:charts="sap.ca.ui.charts">
                <mvc:content>
                    <charts:BubbleChart>
                        <🢂charts:content🢀>
                        </charts:content>
                    </charts:BubbleChart>
                </mvc:content>
            </m:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          element: [validateUseOfDeprecatedAggregation],
        },
        assertion: (issues) => {
          expect(issues).to.not.be.empty;

          expect(issues).to.deep.include.members([
            {
              kind: "UseOfDeprecatedAggregation",
              message:
                "The content aggregation is deprecated since version 7.20.0. This method is deprecated now.",
              severity: "warn",
              offsetRange: computeExpectedRange(xmlSnippet),
            },
          ]);
        },
      });
    });

    it("will detect usage of a deprecated aggregation with self closing syntax", () => {
      const xmlSnippet = `
            <mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:charts="sap.ca.ui.charts">
                <mvc:content>
                    <charts:BubbleChart>
                        <🢂charts:content🢀/>
                    </charts:BubbleChart>
                </mvc:content>
            </m:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          element: [validateUseOfDeprecatedAggregation],
        },
        assertion: (issues) => {
          expect(
            issues,
            "with a self closing tag an issue will only be shown for the opening tag."
          ).to.not.be.empty;
          expect(issues).to.deep.include.members([
            {
              kind: "UseOfDeprecatedAggregation",
              message:
                "The content aggregation is deprecated since version 7.20.0. This method is deprecated now.",
              severity: "warn",
              offsetRange: computeExpectedRange(xmlSnippet),
            },
          ]);
        },
      });
    });

    it("will detect usage of a deprecated aggregation in an unclosed element to enable **early warning** to users", () => {
      const xmlSnippet = `
            <mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:charts="sap.ca.ui.charts">
                <mvc:content>
                    <charts:BubbleChart>
                        <🢂charts:content🢀
                    </charts:BubbleChart>
                </mvc:content>
            </m:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          element: [validateUseOfDeprecatedAggregation],
        },
        assertion: (issues) => {
          expect(issues).to.not.be.empty;

          expect(issues).to.deep.include.members([
            {
              kind: "UseOfDeprecatedAggregation",
              message:
                "The content aggregation is deprecated since version 7.20.0. This method is deprecated now.",
              severity: "warn",
              offsetRange: computeExpectedRange(xmlSnippet),
            },
          ]);
        },
      });
    });
  });

  context("negative edge cases", () => {
    it("will not detect an issue when the aggregation has not been deprecated", () => {
      const xmlSnippet = `
            <mvc:View xmlns:m="sap.m" xmlns:mvc="sap.ui.core.mvc" xmlns:charts="sap.ca.ui.charts">
                <mvc:content>
                    <m:Bar>
                        <!-- unlike sap.ca.ui.charts.BubbleChart.content, sap.ui.core.TooltipBase is not deprecated -->
                        <m:tooltip></m:tooltip>
                    </m:Bar>
                </mvc:content>
            </m:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          element: [validateUseOfDeprecatedAggregation],
        },
        assertion: (issues) => {
          expect(issues).to.be.empty;
        },
      });
    });
  });
});

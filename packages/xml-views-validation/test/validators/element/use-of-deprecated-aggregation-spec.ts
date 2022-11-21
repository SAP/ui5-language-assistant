import { partial, find } from "lodash";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { generate } from "@ui5-language-assistant/semantic-model";
import { generateModel } from "@ui5-language-assistant/test-utils";
import { validators } from "../../../src/api";
import {
  buildDeprecatedIssueMessage,
  DeprecatedUI5Symbol,
} from "../../../src/utils/deprecated-message-builder";
import {
  assertNoIssues as assertNoIssuesBase,
  assertSingleIssue as assertSingleIssueBase,
  getDefaultContext,
} from "../../test-utils";
import { Context as AppContext } from "@ui5-language-assistant/context";

describe("the use of deprecated aggregation validation", () => {
  let ui5SemanticModel: UI5SemanticModel;
  let appContext: AppContext;
  before(async () => {
    ui5SemanticModel = await generateModel({
      framework: "SAPUI5",
      version: "1.71.49",
      modelGenerator: generate,
    });
    appContext = getDefaultContext(ui5SemanticModel);
  });

  context("true positive scenarios", () => {
    let assertSingleIssue: (xmlSnippet: string, message: string) => void;
    before(() => {
      assertSingleIssue = partial(
        assertSingleIssueBase,
        appContext,
        {
          element: [validators.validateUseOfDeprecatedAggregation],
        },
        "UseOfDeprecatedAggregation",
        "warn"
      );
    });

    it("will detect usage of a deprecated aggregation", () => {
      const bubbleChart =
        ui5SemanticModel.classes["sap.ca.ui.charts.BubbleChart"];
      const contentAggregation = find(
        bubbleChart.aggregations,
        (_) => _.name === "content"
      );

      assertSingleIssue(
        `<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:charts="sap.ca.ui.charts">
          <mvc:content>
            <charts:BubbleChart>
                <🢂charts:content🢀>
                </charts:content>
            </charts:BubbleChart>
          </mvc:content>
        </m:View>`,
        buildDeprecatedIssueMessage({
          symbol: contentAggregation as DeprecatedUI5Symbol,
          model: ui5SemanticModel,
        })
      );
    });

    it("will detect usage of a deprecated aggregation with self closing syntax", () => {
      const bubbleChart =
        ui5SemanticModel.classes["sap.ca.ui.charts.BubbleChart"];
      const contentAggregation = find(
        bubbleChart.aggregations,
        (_) => _.name === "content"
      );

      assertSingleIssue(
        `<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:charts="sap.ca.ui.charts">
          <mvc:content>
            <charts:BubbleChart>
                <🢂charts:content🢀/>
            </charts:BubbleChart>
          </mvc:content>
        </m:View>`,
        buildDeprecatedIssueMessage({
          symbol: contentAggregation as DeprecatedUI5Symbol,
          model: ui5SemanticModel,
        })
      );
    });

    it("will detect usage of a deprecated aggregation in an unclosed element to enable **early warning** to users", () => {
      const bubbleChart =
        ui5SemanticModel.classes["sap.ca.ui.charts.BubbleChart"];
      const contentAggregation = find(
        bubbleChart.aggregations,
        (_) => _.name === "content"
      );

      assertSingleIssue(
        `<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:charts="sap.ca.ui.charts">
          <mvc:content>
            <charts:BubbleChart>
              <🢂charts:content🢀
            </charts:BubbleChart>
          </mvc:content>
        </m:View>`,
        buildDeprecatedIssueMessage({
          symbol: contentAggregation as DeprecatedUI5Symbol,
          model: ui5SemanticModel,
        })
      );
    });
  });

  context("negative edge cases", () => {
    let assertNoIssues: (xmlSnippet: string) => void;
    before(() => {
      assertNoIssues = partial(assertNoIssuesBase, appContext, {
        element: [validators.validateUseOfDeprecatedAggregation],
      });
    });

    it("will not detect an issue when the aggregation has not been deprecated", () => {
      assertNoIssues(
        `<mvc:View xmlns:m="sap.m" xmlns:mvc="sap.ui.core.mvc" xmlns:charts="sap.ca.ui.charts">
          <mvc:content>
            <m:Bar>
              <!-- unlike sap.ca.ui.charts.BubbleChart.content, sap.ui.core.TooltipBase is not deprecated -->
              <m:tooltip></m:tooltip>
            </m:Bar>
          </mvc:content>
        </m:View>`
      );
    });
  });
});

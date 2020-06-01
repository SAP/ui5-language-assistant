import { partial } from "lodash";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { generateModel } from "@ui5-language-assistant/test-utils";
import {
  assertNoIssues as assertNoIssuesBase,
  assertSingleIssue as assertSingleIssueBase,
} from "../../test-utils";
import { validateExplicitAggregationCardinality } from "../../../src/validators/elements/cardinality-of-aggregation";
import {
  getMessage,
  INVALID_AGGREGATION_CARDINALITY,
} from "../../../src/utils/messages";

describe("the cardinality aggregation validation", () => {
  let ui5SemanticModel: UI5SemanticModel;

  before(async () => {
    ui5SemanticModel = await generateModel({ version: "1.74.0" });
  });

  context("true positive scenarios", () => {
    let assertSingleIssue: (xmlSnippet: string, message: string) => void;
    before(() => {
      assertSingleIssue = partial(
        assertSingleIssueBase,
        ui5SemanticModel,
        {
          element: [validateExplicitAggregationCardinality],
        },
        "InvalidAggregationCardinality",
        "error"
      );
    });

    it("will detect aggregation with cardinality of 0..1 with more than one element", () => {
      assertSingleIssue(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
            <m:Panel>
              <headerToolbar>
                <m:Toolbar></m:Toolbar>
                <🢂m:Toolbar🢀></m:Toolbar>
              </headerToolbar>
            </m:Panel>
          </mvc:View>`,
        getMessage(INVALID_AGGREGATION_CARDINALITY, "headerToolbar")
      );
    });

    it("multi tags with single aggreation - will detect aggregation with more elements than its cardinality allows", () => {
      assertSingleIssue(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
            <m:Panel>
              <headerToolbar>
                <m:Toolbar></m:Toolbar>
              </headerToolbar>
              <headerToolbar>
                <🢂m:Toolbar🢀></m:Toolbar>
              </headerToolbar>
            </m:Panel>
          </mvc:View>`,
        getMessage(INVALID_AGGREGATION_CARDINALITY, "headerToolbar")
      );
    });

    it("will detect aggregation with cardinality of 0..1 with more than one element - element without name", () => {
      assertSingleIssue(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
            <m:Panel>
              <headerToolbar>
                <m:Toolbar></m:Toolbar>
              </headerToolbar>
              <headerToolbar>
              🢂<></>🢀
              </headerToolbar>
            </m:Panel>
          </mvc:View>`,
        getMessage(INVALID_AGGREGATION_CARDINALITY, "headerToolbar")
      );
    });
  });

  context("negative edge cases", () => {
    let assertNoIssues: (xmlSnippet: string) => void;
    before(() => {
      assertNoIssues = partial(assertNoIssuesBase, ui5SemanticModel, {
        element: [validateExplicitAggregationCardinality],
      });
    });

    it("will not detect an issue when there is an aggregation with only one element", () => {
      assertNoIssues(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
            <m:Panel>
              <headerToolbar>
                <m:Toolbar></m:Toolbar>
              </headerToolbar>
            </m:Panel>
          </mvc:View>`
      );
    });

    it("will not detect an issue when there is an aggregation with cardinality of 0..n", () => {
      assertNoIssues(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
            <m:Panel>
              <content>
                <m:Toolbar></m:Toolbar>
                <m:Toolbar></m:Toolbar>
              </content>
            </m:Panel>
          </mvc:View>`
      );
    });
  });
});

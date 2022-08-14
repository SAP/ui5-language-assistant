import { partial } from "lodash";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { generateModel } from "@ui5-language-assistant/test-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import {
  validations,
  buildMessage,
} from "@ui5-language-assistant/user-facing-text";
import { validators } from "../../../src/api";
import {
  assertNoIssues as assertNoIssuesBase,
  assertSingleIssue as assertSingleIssueBase,
} from "../../test-utils";

const { INVALID_AGGREGATION_CARDINALITY } = validations;

describe("the cardinality aggregation validation", () => {
  let ui5SemanticModel: UI5SemanticModel;

  before(async () => {
    ui5SemanticModel = await generateModel({
      framework: "sapui5",
      version: "1.71.49",
      modelGenerator: generate,
    });
  });

  context("true positive scenarios", () => {
    let assertSingleIssue: (xmlSnippet: string, message: string) => void;
    before(() => {
      assertSingleIssue = partial(
        assertSingleIssueBase,
        ui5SemanticModel,
        {
          element: [validators.validateExplicitAggregationCardinality],
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
              <m:headerToolbar>
                <m:Toolbar></m:Toolbar>
                <🢂m:Toolbar🢀></m:Toolbar>
              </m:headerToolbar>
            </m:Panel>
          </mvc:View>`,
        buildMessage(INVALID_AGGREGATION_CARDINALITY.msg, "headerToolbar")
      );
    });

    it("multi tags with single aggreation - will detect aggregation with more elements than its cardinality allows", () => {
      assertSingleIssue(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
            <m:Panel>
              <m:headerToolbar>
                <m:Toolbar></m:Toolbar>
              </m:headerToolbar>
              <m:headerToolbar>
                <🢂m:Toolbar🢀></m:Toolbar>
              </m:headerToolbar>
            </m:Panel>
          </mvc:View>`,
        buildMessage(INVALID_AGGREGATION_CARDINALITY.msg, "headerToolbar")
      );
    });

    it("will detect aggregation with cardinality of 0..1 with more than one element - element without name", () => {
      assertSingleIssue(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
            <m:Panel>
              <m:headerToolbar>
                <m:Toolbar></m:Toolbar>
              </m:headerToolbar>
              <m:headerToolbar>
              🢂<></>🢀
              </m:headerToolbar>
            </m:Panel>
          </mvc:View>`,
        buildMessage(INVALID_AGGREGATION_CARDINALITY.msg, "headerToolbar")
      );
    });
  });

  context("negative edge cases", () => {
    let assertNoIssues: (xmlSnippet: string) => void;
    before(() => {
      assertNoIssues = partial(assertNoIssuesBase, ui5SemanticModel, {
        element: [validators.validateExplicitAggregationCardinality],
      });
    });

    it("will not detect an issue when there is an aggregation with only one element", () => {
      assertNoIssues(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
            <m:Panel>
              <m:headerToolbar>
                <m:Toolbar></m:Toolbar>
              </m:headerToolbar>
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

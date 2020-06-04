import { partial } from "lodash";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { generateModel } from "@ui5-language-assistant/test-utils";
import {
  assertNoIssues as assertNoIssuesBase,
  assertSingleIssue as assertSingleIssueBase,
} from "../../test-utils";
import { validateAggregationType } from "../../../src/validators/elements/type-of-aggregation";
import {
  getMessage,
  INVALID_AGGREGATION_TYPE,
} from "../../../src/utils/messages";

describe("the type aggregation validation", () => {
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
          element: [validateAggregationType],
        },
        "InvalidAggregationType",
        "error"
      );
    });

    it("will detect mismatch of class to explicit aggregation type", () => {
      assertSingleIssue(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
            <m:Panel>
              <m:headerToolbar>
                <🢂Toolbar🢀></Toolbar>
              </m:headerToolbar>
            </m:Panel>
          </mvc:View>`,
        getMessage(INVALID_AGGREGATION_TYPE, "Toolbar", "Toolbar")
      );
    });

    it("will detect mismatch of class to explicit aggregation of 'UI5Interface' type", () => {
      assertSingleIssue(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.ui.commons">
              <m:Panel>
                <🢂ToolbarSeparator🢀></ToolbarSeparator>
              </m:Panel>
            </mvc:View>`,
        getMessage(INVALID_AGGREGATION_TYPE, "ToolbarSeparator", "Control")
      );
    });

    it("will detect mismatch of class to default aggregation type", () => {
      assertSingleIssue(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.ui.commons">
              <m:Page>
                <m:footer>
                  <🢂Toolbar🢀></Toolbar>
                </m:footer>
              </m:Page>
            </mvc:View>`,
        getMessage(INVALID_AGGREGATION_TYPE, "Toolbar", "IBar")
      );
    });
  });

  context("negative edge cases", () => {
    let assertNoIssues: (xmlSnippet: string) => void;
    before(() => {
      assertNoIssues = partial(assertNoIssuesBase, ui5SemanticModel, {
        element: [validateAggregationType],
      });
    });

    it("will not detect an issue when the class is not under aggregation", () => {
      assertNoIssues(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.ui.commons">
              <m:Shell></m:Shell>
            </mvc:View>`
      );
    });
  });
});

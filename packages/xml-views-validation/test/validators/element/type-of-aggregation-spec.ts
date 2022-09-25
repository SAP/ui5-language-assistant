import { expect } from "chai";
import { partial, cloneDeep, find } from "lodash";
import {
  UI5SemanticModel,
  UI5Aggregation,
  AppContext,
} from "@ui5-language-assistant/semantic-model-types";
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

const { INVALID_AGGREGATION_TYPE } = validations;

describe("the type aggregation validation", () => {
  let ui5SemanticModel: UI5SemanticModel;
  let appContext: AppContext;

  before(async () => {
    ui5SemanticModel = await generateModel({
      framework: "SAPUI5",
      version: "1.71.49",
      modelGenerator: generate,
    });
    appContext = {
      services: {},
      ui5Model: ui5SemanticModel,
    };
  });

  context("true positive scenarios", () => {
    let assertSingleIssue: (xmlSnippet: string, message: string) => void;
    before(() => {
      assertSingleIssue = partial(
        assertSingleIssueBase,
        appContext,
        {
          element: [validators.validateAggregationType],
        },
        "InvalidAggregationType",
        "error"
      );
    });

    it("will detect mismatch of class to explicit aggregation of 'UI5Class' type", () => {
      assertSingleIssue(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
            <m:Panel>
              <m:headerToolbar>
                <🢂Button🢀></Button>
              </m:headerToolbar>
            </m:Panel>
         </mvc:View>`,
        buildMessage(
          INVALID_AGGREGATION_TYPE.msg,
          "Button",
          "headerToolbar",
          "Toolbar"
        )
      );
    });

    it("will detect mismatch of class to default aggregation of 'UI5Interface' type", () => {
      assertSingleIssue(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.ui.commons">
              <m:Panel>
                <🢂ToolbarSeparator🢀></ToolbarSeparator>
              </m:Panel>
         </mvc:View>`,
        buildMessage(
          INVALID_AGGREGATION_TYPE.msg,
          "ToolbarSeparator",
          "content",
          "Control"
        )
      );
    });

    it("will detect mismatch of class to explicit aggregation of 'UI5Class' type", () => {
      assertSingleIssue(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.ui.commons">
              <m:Page>
                <m:footer>
                  <!-- The class "Toolbar" is under the aggregation "footer" and must match the type "IBar" -->
                  <🢂Toolbar🢀></Toolbar>
                </m:footer>
              </m:Page>
        </mvc:View>`,
        buildMessage(INVALID_AGGREGATION_TYPE.msg, "Toolbar", "footer", "IBar")
      );
    });
  });

  context("negative edge cases", () => {
    let assertNoIssues: (xmlSnippet: string) => void;
    before(() => {
      assertNoIssues = partial(assertNoIssuesBase, appContext, {
        element: [validators.validateAggregationType],
      });
    });

    it("will not detect an issue when the class is under the default aggregation and matching its type", () => {
      assertNoIssues(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.ui.commons">
          <m:Shell></m:Shell>
        </mvc:View>`
      );
    });

    it("will not detect an issue when the class is under non-ui5 aggregation", () => {
      assertNoIssues(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
        xmlns:mvc="sap.ui.core.mvc"
        xmlns="sap.ui.commons">
        <UnknownTag>
          <Toolbar></Toolbar>
        </UnknownTag>
      </mvc:View>`
      );
    });

    it("will not detect an issue when the class is under explicit aggregation when the aggregartion type is not a UI5Class or UI5Interface", () => {
      const clonedModel = cloneDeep(appContext);
      const viewClass = clonedModel.ui5Model.classes["sap.ui.core.mvc.View"];
      const contentAggregation = find(
        viewClass.aggregations,
        (_) => _.name === "content"
      ) as UI5Aggregation;
      expect(contentAggregation).to.exist;
      contentAggregation.type = undefined;
      viewClass.aggregations = [contentAggregation];
      const xmlSnippet = `
      <mvc:View
        xmlns:mvc="sap.ui.core.mvc"
        xmlns="sap.m">
        <mvc:content>
          <Shell></Shell>
        </mvc:content>
      </mvc:View>`;

      assertNoIssuesBase(
        clonedModel,
        {
          element: [validators.validateAggregationType],
        },
        xmlSnippet
      );
    });

    it("will not detect an issue when the class is a `sap.ui.core.Fragment", () => {
      assertNoIssues(
        `<mvc:View xmlns:uxap="sap.uxap" 
        xmlns:m="sap.m"
        xmlns:mvc="sap.ui.core.mvc"
        xmlns:core="sap.ui.core">
        <m:Page>
            <m:content>
                <core:Fragment fragmentName="Fragment1" type="XML" />
            </m:content>
        </m:Page>
      </mvc:View>`
      );
    });
  });
});

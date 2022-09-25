import { partial } from "lodash";
import {
  AppContext,
  UI5SemanticModel,
} from "@ui5-language-assistant/semantic-model-types";
import { generateModel } from "@ui5-language-assistant/test-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import {
  validations,
  buildMessage,
} from "@ui5-language-assistant/user-facing-text";
import {
  assertNoIssues as assertNoIssuesBase,
  assertSingleIssue as assertSingleIssueBase,
} from "../../test-utils";
import { validators } from "../../../src/api";

const { NON_STABLE_ID } = validations;

describe("the use of non stable id validation", () => {
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
          element: [validators.validateNonStableId],
        },
        "NonStableIDIssue",
        "error"
      );
    });

    it("will detect missing stable id in non-whitelisted UI5 class", () => {
      assertSingleIssue(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.ui.commons">
            <🢂m:Panel🢀>
            </m:Panel>
        </mvc:View>`,
        buildMessage(NON_STABLE_ID.msg, "Panel")
      );
    });

    it("will detect missing stable id in custom control", () => {
      assertSingleIssue(
        `<mvc:View xmlns:uxap="sap.uxap"
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.ui.commons" xmlns:custom="sap.m">
            <🢂custom:Button🢀>
            </custom:Button>
        </mvc:View>`,
        buildMessage(NON_STABLE_ID.msg, "Button")
      );
    });

    it("will detect missing stable id in root level custom control", () => {
      assertSingleIssue(
        `<🢂custom:View🢀
          xmlns:custom="foo.bar"
          xmlns="bar.foo">
            <Button id="dummy-id">
            </Button>
        </custom:View>`,
        buildMessage(NON_STABLE_ID.msg, "View")
      );
    });

    it("will detect missing stable id in whitelisted root class when it's not in the root", () => {
      assertSingleIssue(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons">
              <🢂mvc:View🢀>
              </mvc:View>
          </mvc:View>`,
        buildMessage(NON_STABLE_ID.msg, "View")
      );
    });

    it("will detect missing stable in sub element when the parent element has attribute sap.ui.dt:designtime='not-adaptable'", () => {
      assertSingleIssue(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.ui.commons"
          xmlns:sap.ui.dt="sap.ui.dt">
            <m:Panel sap.ui.dt:designtime="not-adaptable">
              <🢂m:Button🢀></m:Button>
            </m:Panel>
        </mvc:View>`,
        buildMessage(NON_STABLE_ID.msg, "Button")
      );
    });

    it("will detect missing stable id when there is null id attribute value", () => {
      assertSingleIssue(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.ui.commons">
            <🢂m:Panel🢀 id=>
            </m:Panel>
        </mvc:View>`,
        buildMessage(NON_STABLE_ID.msg, "Panel")
      );
    });

    it("will detect missing stable id when there is empty id attribute value", () => {
      assertSingleIssue(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.ui.commons">
            <🢂m:Panel🢀 id="">
            </m:Panel>
        </mvc:View>`,
        buildMessage(NON_STABLE_ID.msg, "Panel")
      );
    });
  });

  context("negative edge cases", () => {
    let assertNoIssues: (xmlSnippet: string) => void;
    before(() => {
      assertNoIssues = partial(assertNoIssuesBase, appContext, {
        element: [validators.validateNonStableId],
      });
    });

    it("will not detect an issue for a root-whitelisted UI5 class", () => {
      assertNoIssues(
        `<!-- sap.ui.core.mvc.View is whitlisted root class -->
        <mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.ui.commons">
        </mvc:View>`
      );
    });

    it("will not detect an issue for a root-whitelisted UI5 class - core ns", () => {
      assertNoIssues(
        `<!-- sap.ui.core.FragmentDefinition is whitlisted root class -->
        <core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">
        </core:FragmentDefinition>`
      );
    });

    it("will not detect an issue for a whitelisted UI5 class", () => {
      assertNoIssues(
        `<mvc:View xmlns:core="sap.ui.core" xmlns:uxap="sap.uxap" xmlns:m="sap.m"
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.ui.commons">
            <m:Button id="yyy">
                <m:customData>
                    <core:CustomData></core:CustomData>
                </m:customData>
            </m:Button>
        </mvc:View>`
      );
    });

    it("will not detect an issue for a control with attribute sap.ui.dt:designtime='not-adaptable'", () => {
      assertNoIssues(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons"
            xmlns:sap.ui.dt="sap.ui.dt">
              <m:Panel sap.ui.dt:designtime="not-adaptable">
              </m:Panel>
        </mvc:View>`
      );
    });

    it("will not detect an issue for a control and it's sub elements when it contains attribute sap.ui.dt:designtime='not-adaptable-tree'", () => {
      assertNoIssues(
        `<mvc:View xmlns:uxap="sap.uxap" xmlns:m="sap.m"
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.ui.commons"
          xmlns:sap.ui.dt="sap.ui.dt">
            <m:Panel sap.ui.dt:designtime="not-adaptable-tree">
                <m:Button>
                </m:Button>
            </m:Panel>
        </mvc:View>`
      );
    });

    it("will not detect an issue for tag without a name", () => {
      assertNoIssues(
        `< >
        </View>`
      );
    });
  });
});

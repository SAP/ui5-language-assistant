import { find, partial } from "lodash";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  generateModel,
  expectExists,
  DEFAULT_UI5_VERSION,
  getFallbackPatchVersions,
} from "@ui5-language-assistant/test-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import { validators } from "../../../../src/api";
import {
  assertNoIssues as assertNoIssuesBase,
  assertSingleIssue as assertSingleIssueBase,
  getDefaultContext,
} from "../../test-utils";
import { Context as AppContext } from "@ui5-language-assistant/context";

describe("the unknown attribute name validation", () => {
  let ui5SemanticModel: UI5SemanticModel;
  let appContext: AppContext;
  beforeAll(async () => {
    ui5SemanticModel = await generateModel({
      framework: "SAPUI5",
      version: (
        await getFallbackPatchVersions()
      ).SAPUI5 as typeof DEFAULT_UI5_VERSION,
      modelGenerator: generate,
    });
    appContext = getDefaultContext(ui5SemanticModel);
  });

  describe("true positive scenarios", () => {
    let assertSingleIssue: (xmlSnippet: string, message: string) => void;
    beforeAll(() => {
      assertSingleIssue = partial(
        assertSingleIssueBase,
        appContext,
        {
          attribute: [validators.validateUnknownAttributeKey],
        },
        "UnknownAttributeKey",
        "error"
      );
    });

    it("will detect an invalid attribute key in root class element", () => {
      assertSingleIssue(
        `<mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m"
          🢂busy_TYPO🢀="true">
        </mvc:View>`,
        "Unknown attribute key: busy_TYPO"
      );
    });

    it("will detect an invalid attribute key when the key starts with :", () => {
      assertSingleIssue(
        `<mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m"
          🢂:busy🢀="true">
        </mvc:View>`,
        "Unknown attribute key: :busy"
      );
    });

    it("will detect an invalid attribute key when the key ends with :", () => {
      assertSingleIssue(
        `<mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m"
          🢂busy:🢀="true">
        </mvc:View>`,
        "Unknown attribute key: busy:"
      );
    });

    it("will detect an invalid attribute key in non-root class element", () => {
      assertSingleIssue(
        `<mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <mvc:content>
            <List 🢂TYPO🢀=""></List>
          </mvc:content>
        </mvc:View>`,
        "Unknown attribute key: TYPO"
      );
    });

    it("will detect an invalid attribute key when the attribute doesn't have a value", () => {
      assertSingleIssue(
        `<mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m"
          🢂busy_TYPO🢀 >
        </mvc:View>`,
        "Unknown attribute key: busy_TYPO"
      );
    });

    it("will detect an invalid attribute key in aggregation element", () => {
      assertSingleIssue(
        `<mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <mvc:content 🢂TYPO🢀="">
            <List></List>
          </mvc:content>
        </mvc:View>`,
        "Unknown attribute key: TYPO"
      );
    });

    it("will detect an invalid xmlns attribute key element - no prefix", () => {
      assertSingleIssue(
        `<mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m"
          🢂xmlns:🢀="my.ns">
        </mvc:View>`,
        "Unknown attribute key: xmlns:"
      );
    });

    it("will detect an invalid xmlns attribute key element - more than 1 colon", () => {
      assertSingleIssue(
        `<mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          🢂xmlns:m:1🢀="sap.m">
        </mvc:View>`,
        "Unknown attribute key: xmlns:m:1"
      );
    });

    it("will detect 'stashed' as invalid in aggregation element", () => {
      assertSingleIssue(
        `<mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <mvc:content 🢂stashed🢀="">
            <List></List>
          </mvc:content>
        </mvc:View>`,
        "Unknown attribute key: stashed"
      );
    });

    it("will detect 'binding' as invalid in aggregation element", () => {
      assertSingleIssue(
        `<mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <mvc:content 🢂binding🢀="">
            <List></List>
          </mvc:content>
        </mvc:View>`,
        "Unknown attribute key: binding"
      );
    });

    it("will detect 'class' as invalid in aggregation element", () => {
      assertSingleIssue(
        `<mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <mvc:content 🢂class🢀="">
            <List></List>
          </mvc:content>
        </mvc:View>`,
        "Unknown attribute key: class"
      );
    });

    it("will detect 'require' as invalid attribute when it's not in the core or template namespace", () => {
      assertSingleIssue(
        `<mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m"
          🢂mvc:require🢀="">
        </mvc:View>`,
        "Unknown attribute key: mvc:require"
      );
    });

    it("will detect a non-public attribute key in class element", () => {
      // Check that the property exists in the model
      const ui5Class = ui5SemanticModel.classes["sap.uxap.AnchorBar"];
      expectExists(ui5Class, "sap.uxap.AnchorBar");
      const _selectProperty = find(ui5Class.aggregations, ["name", "_select"]);
      expectExists(_selectProperty, "_select");

      assertSingleIssue(
        `<mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns:uxap="sap.uxap">
          <mvc:content>
            <uxap:AnchorBar 🢂_select🢀=""></uxap:AnchorBar>
          </mvc:content>
        </mvc:View>`,
        "Unknown attribute key: _select"
      );
    });
  });

  describe("negative edge cases", () => {
    let assertNoIssues: (xmlSnippet: string) => void;
    beforeAll(() => {
      assertNoIssues = partial(assertNoIssuesBase, appContext, {
        attribute: [validators.validateUnknownAttributeKey],
      });
    });

    describe("class tag", () => {
      it("will not detect an issue when the attribute is a property", () => {
        assertNoIssues(`
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            busy="true">
          </mvc:View>`);
      });

      it("will not detect an issue when the attribute is an event", () => {
        assertNoIssues(`
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            afterInit="true">
          </mvc:View>`);
      });

      it("will not detect an issue when the attribute is an association", () => {
        assertNoIssues(`
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
            <mvc:content>
              <m:List ariaLabelledBy="abc"></m:List>
            </mvc:content>
          </mvc:View>`);
      });

      it("will not detect an issue when the attribute is an aggrgation", () => {
        assertNoIssues(`
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            content="{model>elements}">
          </mvc:View>`);
      });

      describe("special attributes", () => {
        it("will not detect an issue when the attribute is 'core:require'", () => {
          assertNoIssues(`
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:core="sap.ui.core"
              core:require="">
            </mvc:View>`);
        });

        it("will not detect an issue when the attribute is 'sap.ui.dt:designtime'", () => {
          assertNoIssues(`
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:dt="sap.ui.dt"
              dt:designtime="">
            </mvc:View>`);
        });

        it("will not detect an issue when the attribute is 'template:require'", () => {
          assertNoIssues(`
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"
              template:require="">
            </mvc:View>`);
        });

        it("will not detect an issue when the attribute is 'binding'", () => {
          assertNoIssues(`
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              binding="{}">
            </mvc:View>`);
        });

        it("will not detect an issue when the attribute is 'class'", () => {
          assertNoIssues(`
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              class="small">
            </mvc:View>`);
        });

        it("will not detect an issue when the attribute namespace is custom data", () => {
          assertNoIssues(`
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:custom="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
              custom:unknownattr="">
            </mvc:View>`);
        });

        it("will not detect an issue when the attribute is 'stashed' on sap.uxap.ObjectPageLazyLoader", () => {
          assertNoIssues(`
            <mvc:View
                xmlns:mvc="sap.ui.core.mvc"
                xmlns:uxap="sap.uxap">
              <mvc:content>
                <uxap:ObjectPageLazyLoader stashed="true"></uxap:ObjectPageLazyLoader>
              </mvc:content>
            </mvc:View>`);
        });

        it("will not detect an issue when the attribute is xmlns (default)", () => {
          assertNoIssues(`
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc">
              <mvc:content>
                <List xmlns="sap.m"></List>
              </mvc:content>
            </mvc:View>`);
        });

        it("will not detect an issue when the attribute is xmlns (with name)", () => {
          assertNoIssues(`
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"">
              <mvc:content>
                <m:List xmlns:m="sap.m"></m:List>
              </mvc:content>
            </mvc:View>`);
        });
      });
    });

    describe("aggregation tag", () => {
      it("will not detect an issue when the attribute is 'core:require'", () => {
        assertNoIssues(`
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns:core="sap.ui.core">
            <mvc:content core:require="">
            </mvc:content>
          </mvc:View>`);
      });

      it("will not detect an issue when the attribute is 'sap.ui.dt:designtime'", () => {
        assertNoIssues(`
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns:dt="sap.ui.dt">
            <mvc:content dt:designtime=""></mvc:content>
          </mvc:View>`);
      });

      it("will not detect an issue when the attribute is 'template:require'", () => {
        assertNoIssues(`
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1">
            <mvc:content template:require=""></mvc:content>
          </mvc:View>`);
      });

      it("will not detect an issue when the attribute namespace is custom data", () => {
        assertNoIssues(`
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns:custom="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1">
            <mvc:content custom:unknownattr=""></mvc:content>
          </mvc:View>`);
      });

      it("will not detect an issue when the attribute is xmlns (default)", () => {
        assertNoIssues(`
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"">
            <mvc:content xmlns="sap.m">
            </mvc:content>
          </mvc:View>`);
      });

      it("will not detect an issue when the attribute is xmlns (with name)", () => {
        assertNoIssues(`
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"">
            <mvc:content xmlns:m="sap.m">
            </mvc:content>
          </mvc:View>`);
      });
    });

    describe("unknown tag", () => {
      it("will not detect an issue when the attribute name is unknown for tag starting with lowecase", () => {
        assertNoIssues(`
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
            <mvc:content_TYPO TYPO="">
            </mvc:content_TYPO>
          </mvc:View>`);
      });

      it("will not detect an issue when the attribute name is unknown for tag starting with uppercase", () => {
        assertNoIssues(`
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc">
            <mvc:content>
              <List_TYPO TYPO=""></List_TYPO>
            </mvc:content>
          </mvc:View>`);
      });

      it("will not detect an issue when the attribute name is unknown for tag in known namespace", () => {
        assertNoIssues(`
          <mvc:View_TYPO
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            busy_TYPO="true">
          </mvc:View_TYPO>`);
      });
    });

    describe("non-reproducible unit tests", () => {
      it("will not detect an issue when the attribute doesn't have a key", () => {
        const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              attr="">
            </mvc:View>`;

        const { cst, tokenVector } = parse(xmlSnippet);
        const ast = buildAst(cst as DocumentCstNode, tokenVector);
        const attr = ast.rootElement?.attributes[0];
        expectExists(attr, "attr");
        const attrWithoutKey = {
          ...attr,
          key: null,
        };
        const issues = validators.validateUnknownAttributeKey(
          attrWithoutKey,
          appContext
        );
        expect(issues).toBeEmpty();
      });
    });
  });
});

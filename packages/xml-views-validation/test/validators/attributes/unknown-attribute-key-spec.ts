import { expect } from "chai";
import { find, partial } from "lodash";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  generateModel,
  expectExists,
} from "@ui5-language-assistant/test-utils";
import {
  assertNoIssues as assertNoIssuesBase,
  assertSingleIssue as assertSingleIssueBase,
} from "../../test-utils";
import { validateUnknownAttributeKey } from "../../../src/validators/attributes/unknown-attribute-key";

describe("the unknown attribute name validation", () => {
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
          attribute: [validateUnknownAttributeKey],
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
          <content>
            <List 🢂TYPO🢀=""></List>
          </content>
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
          <content 🢂TYPO🢀="">
            <List></List>
          </content>
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
          <content 🢂stashed🢀="">
            <List></List>
          </content>
        </mvc:View>`,
        "Unknown attribute key: stashed"
      );
    });

    it("will detect 'binding' as invalid in aggregation element", () => {
      assertSingleIssue(
        `<mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <content 🢂binding🢀="">
            <List></List>
          </content>
        </mvc:View>`,
        "Unknown attribute key: binding"
      );
    });

    it("will detect 'class' as invalid in aggregation element", () => {
      assertSingleIssue(
        `<mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <content 🢂class🢀="">
            <List></List>
          </content>
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
          <content>
            <uxap:AnchorBar 🢂_select🢀=""></uxap:AnchorBar>
          </content>
        </mvc:View>`,
        "Unknown attribute key: _select"
      );
    });
  });

  context("negative edge cases", () => {
    let assertNoIssues: (xmlSnippet: string) => void;
    before(() => {
      assertNoIssues = partial(assertNoIssuesBase, ui5SemanticModel, {
        attribute: [validateUnknownAttributeKey],
      });
    });

    context("class tag", () => {
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
            <content>
              <m:List ariaLabelledBy="abc"></m:List>
            </content>
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

      context("special attributes", () => {
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
              <content>
              <uxap:ObjectPageLazyLoader stashed="true"></uxap:ObjectPageLazyLoader>
              </content>
            </mvc:View>`);
        });

        it("will not detect an issue when the attribute is xmlns (default)", () => {
          assertNoIssues(`
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc">
              <content>
                <List xmlns="sap.m"></List>
              </content>
            </mvc:View>`);
        });

        it("will not detect an issue when the attribute is xmlns (with name)", () => {
          assertNoIssues(`
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"">
              <content>
                <m:List xmlns:m="sap.m"></m:List>
              </content>
            </mvc:View>`);
        });
      });
    });

    context("aggregation tag", () => {
      it("will not detect an issue when the attribute is 'core:require'", () => {
        assertNoIssues(`
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns:core="sap.ui.core">
            <content core:require="">
            </content>
          </mvc:View>`);
      });

      it("will not detect an issue when the attribute is 'sap.ui.dt:designtime'", () => {
        assertNoIssues(`
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns:dt="sap.ui.dt">
            <content dt:designtime=""></content>
          </mvc:View>`);
      });

      it("will not detect an issue when the attribute is 'template:require'", () => {
        assertNoIssues(`
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1">
            <content template:require=""></content>
          </mvc:View>`);
      });

      it("will not detect an issue when the attribute namespace is custom data", () => {
        assertNoIssues(`
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns:custom="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1">
            <content custom:unknownattr=""></content>
          </mvc:View>`);
      });

      it("will not detect an issue when the attribute is xmlns (default)", () => {
        assertNoIssues(`
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"">
            <content xmlns="sap.m">
            </content>
          </mvc:View>`);
      });

      it("will not detect an issue when the attribute is xmlns (with name)", () => {
        assertNoIssues(`
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"">
            <content xmlns:m="sap.m">
            </content>
          </mvc:View>`);
      });
    });

    context("unknown tag", () => {
      it("will not detect an issue when the attribute name is unknown for tag starting with lowecase", () => {
        assertNoIssues(`
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
            <content_TYPO TYPO="">
            </content_TYPO>
          </mvc:View>`);
      });

      it("will not detect an issue when the attribute name is unknown for tag starting with uppercase", () => {
        assertNoIssues(`
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc">
            <content>
              <List_TYPO TYPO=""></List_TYPO>
            </content>
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

    context("non-reproducible unit tests", () => {
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
        const issues = validateUnknownAttributeKey(
          attrWithoutKey,
          ui5SemanticModel
        );
        expect(issues).to.be.empty;
      });
    });
  });
});

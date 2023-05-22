import { partial, find } from "lodash";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  generateModel,
  expectExists,
} from "@ui5-language-assistant/test-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import { validators } from "../../../../src/api";
import {
  buildDeprecatedIssueMessage,
  DeprecatedUI5Symbol,
} from "../../../../src/utils/deprecated-message-builder";
import {
  assertNoIssues as assertNoIssuesBase,
  assertSingleIssue as assertSingleIssueBase,
  getDefaultContext,
} from "../../test-utils";
import { Context as AppContext } from "@ui5-language-assistant/context";

describe("the use of deprecated attribute validation", () => {
  let ui5SemanticModel: UI5SemanticModel;
  let appContext: AppContext;
  beforeAll(async () => {
    ui5SemanticModel = await generateModel({
      framework: "SAPUI5",
      version: "1.71.49",
      modelGenerator: generate,
    });
    appContext = getDefaultContext(ui5SemanticModel);
  });

  describe("true positive scenarios", () => {
    function assertSingleIssue(
      xmlSnippet: string,
      message: string,
      issueKind: string
    ) {
      return assertSingleIssueBase(
        appContext,
        {
          attribute: [validators.validateUseOfDeprecatedAttribute],
        },
        issueKind,
        "warn",
        xmlSnippet,
        message
      );
    }

    it("will detect usage of a deprecated attribute property", () => {
      const pageClass = ui5SemanticModel.classes["sap.m.Page"];
      const navButtonTextProperty = find(
        pageClass.properties,
        (_) => _.name === "navButtonText"
      );

      assertSingleIssue(
        `<mvc:View xmlns:m="sap.m" 
          xmlns:mvc="sap.ui.core.mvc">
          <m:Page 🢂navButtonText🢀="">
          </m:Page>
        </mvc:View>`,
        buildDeprecatedIssueMessage({
          symbol: navButtonTextProperty as DeprecatedUI5Symbol,
          model: ui5SemanticModel,
        }),
        "UseOfDeprecatedProperty"
      );
    });

    it("will detect usage of a deprecated attribute event", () => {
      const appClass = ui5SemanticModel.classes["sap.m.App"];
      const orientationChangeEvent = find(
        appClass.events,
        (_) => _.name === "orientationChange"
      );

      assertSingleIssue(
        `<mvc:View xmlns:m="sap.m" 
          xmlns:mvc="sap.ui.core.mvc">
          <m:App 🢂orientationChange🢀="">
          </m:App>
        </mvc:View>`,
        buildDeprecatedIssueMessage({
          symbol: orientationChangeEvent as DeprecatedUI5Symbol,
          model: ui5SemanticModel,
        }),
        "UseOfDeprecatedEvent"
      );
    });

    it("will detect usage of a deprecated attribute association", () => {
      const popoverClass = ui5SemanticModel.classes["sap.m.Popover"];
      const leftButtonAssociation = find(
        popoverClass.associations,
        (_) => _.name === "leftButton"
      );

      assertSingleIssue(
        `<mvc:View xmlns:m="sap.m" 
          xmlns:mvc="sap.ui.core.mvc">
          <m:Popover 🢂leftButton🢀="">
          </m:Popover>
        </mvc:View>`,
        buildDeprecatedIssueMessage({
          symbol: leftButtonAssociation as DeprecatedUI5Symbol,
          model: ui5SemanticModel,
        }),
        "UseOfDeprecatedAssociation"
      );
    });

    it("will detect usage of a deprecated attribute aggregation", () => {
      const genericTileClass = ui5SemanticModel.classes["sap.m.GenericTile"];
      const iconAggregation = find(
        genericTileClass.aggregations,
        (_) => _.name === "icon"
      );

      assertSingleIssue(
        `<mvc:View xmlns:m="sap.m" 
          xmlns:mvc="sap.ui.core.mvc">
          <m:GenericTile 🢂icon🢀="">
          </m:GenericTile> 
        </mvc:View>`,
        buildDeprecatedIssueMessage({
          symbol: iconAggregation as DeprecatedUI5Symbol,
          model: ui5SemanticModel,
        }),
        "UseOfDeprecatedAggregation"
      );
    });
  });

  describe("negative edge cases", () => {
    let assertNoIssues: (xmlSnippet: string) => void;
    beforeAll(() => {
      assertNoIssues = partial(assertNoIssuesBase, appContext, {
        attribute: [validators.validateUseOfDeprecatedAttribute],
      });
    });

    it("will not detect an issue when the attribute key has not been deprecated", () => {
      assertNoIssues(
        `<mvc:View xmlns:m="sap.m" 
          xmlns:mvc="sap.ui.core.mvc" busy="true">
        </mvc:View`
      );
    });

    it("will not detect an issue when the enclosing tag is not a UI5 class", () => {
      assertNoIssues(
        `<mvc:View1
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m"
          busy="true">
        </mvc:View1>`
      );
    });

    it("will not detect an issue when the attribute is part of a UI5 Class tag but not a recognized property", () => {
      assertNoIssues(
        `<mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m"
          busy1="untrue">
        </mvc:View>`
      );
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

      const issues = validators.validateUseOfDeprecatedAttribute(
        attrWithoutKey,
        appContext
      );

      expect(issues).toBeEmpty();
    });
  });
});

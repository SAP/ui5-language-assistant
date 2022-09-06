import { partial, find } from "lodash";
import { expect } from "chai";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  generateModel,
  expectExists,
} from "@ui5-language-assistant/test-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import { validators } from "../../../src/api";
import {
  assertNoIssues as assertNoIssuesBase,
  assertSingleIssue as assertSingleIssueBase,
} from "../../test-utils";

describe("the use of hardcoded i18n string validation", () => {
  let ui5SemanticModel: UI5SemanticModel;

  before(async () => {
    ui5SemanticModel = await generateModel({
      framework: "SAPUI5",
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
          attribute: [validators.validateI18nExternalization],
        },
        "UseOfHardcodedI18nString",
        "warn"
      );
    });

    it("will detect usage of a hardcoded i18n string value", () => {
      assertSingleIssue(
        `<mvc:View xmlns:m="sap.m"
           xmlns:mvc="sap.ui.core.mvc">
           <m:Page>
             <m:Button text=🢂"i18n_dummy_text"🢀/>
           </m:Page>
         </mvc:View>`,
        'Consider externalizing UI texts to a resource bundle or other model: "i18n_dummy_text".'
      );
    });
  });

  context("negative edge cases", () => {
    let assertNoIssues: (xmlSnippet: string) => void;
    before(() => {
      assertNoIssues = partial(assertNoIssuesBase, ui5SemanticModel, {
        attribute: [validators.validateI18nExternalization],
      });
    });

    it("will not detect an issue when the attribute key is bound", () => {
      assertNoIssues(
        `<mvc:View xmlns:m="sap.m"
           xmlns:mvc="sap.ui.core.mvc">
           <m:Page>
             <m:Button text=🢂"{i18n_dummy_text}"🢀/>
           </m:Page>
         </mvc:View>`
      );
    });
  });

  context("non-reproducible unit tests", () => {
    it("will not detect an issue when the attribute doesn't have a key", () => {
      const xmlSnippet = `<mvc:View xmlns:m="sap.m"
           xmlns:mvc="sap.ui.core.mvc">
           <m:Page>
             <m:Button text=🢂""🢀/>
           </m:Page>
         </mvc:View>`;

      const { cst, tokenVector } = parse(xmlSnippet);
      const ast = buildAst(cst as DocumentCstNode, tokenVector);
      const attr = ast.rootElement?.attributes[0];
      expectExists(attr, "attr");
      const attrWithoutKey = {
        ...attr,
        key: null,
      };

      const issues = validators.validateI18nExternalization(
        attrWithoutKey,
        ui5SemanticModel
      );

      expect(issues).to.be.empty;
    });
  });
});

import { find, map, forEach } from "lodash";
import { buildAst, XMLElement } from "@xml-tools/ast";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import {
  UI5Aggregation,
  UI5SemanticModel,
} from "@ui5-language-assistant/semantic-model-types";
import { generateModel } from "@ui5-language-assistant/test-utils";
import { CodeAssistSettings } from "@ui5-language-assistant/settings";
import { ui5NodeToFQN } from "@ui5-language-assistant/logic-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import {
  getXMLViewCompletions,
  isUI5NodeXMLViewCompletion,
} from "../../src/api";
import { UI5XMLViewCompletion } from "../../api";
import { Context as AppContext } from "@ui5-language-assistant/context";
import { getDefaultContext } from "./utils";

describe("The `getXMLViewCompletions()` api", () => {
  let REAL_UI5_MODEL: UI5SemanticModel;
  let appContext: AppContext;
  beforeAll(async function () {
    REAL_UI5_MODEL = await generateModel({
      framework: "SAPUI5",
      version: "1.71.60",
      modelGenerator: generate,
    });
    appContext = getDefaultContext(REAL_UI5_MODEL);
  });

  it("will filter none public/protected suggestions", () => {
    const xmlSnippet = `
          <mvc:View
            xmlns="sap.ui.core">
            <XMLComposite>
              <⇶
            </XMLComposite>
          </mvc:View>`;

    const xmlCompositeClass =
      REAL_UI5_MODEL.classes["sap.ui.core.XMLComposite"];
    const _contentAggregation = find<UI5Aggregation>(
      xmlCompositeClass.aggregations,
      (_) => _.name === "_content"
    ) as UI5Aggregation;
    expect(_contentAggregation).not.toBeUndefined();
    expect(_contentAggregation.visibility).toEqual("hidden");

    testSuggestionsScenario({
      context: appContext,
      xmlText: xmlSnippet,
      assertion: (suggestions) => {
        const suggestedNames = map(suggestions, (_) => _.ui5Node.name);
        expect(suggestedNames).not.toBeEmpty();
        expect(suggestedNames).not.toIncludeAnyMembers(["_content"]);
      },
    });
  });

  it("will provide suggestions for aggregations", () => {
    const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
            <Page>
              <⇶
            </Page>
          </mvc:View>`;

    testSuggestionsScenario({
      context: appContext,
      xmlText: xmlSnippet,
      assertion: (suggestions) => {
        const suggestedNames = map(suggestions, (_) => _.ui5Node.name);
        expect(suggestedNames).toIncludeAllMembers([
          "content",
          "customHeader",
          "footer",
          "subHeader",
          "headerContent",
          "landmarkInfo",
          "tooltip",
          "customData",
          "layoutData",
          "dependents",
          "dragDropConfig",
        ]);

        const suggestedAstNode = suggestions[0].astNode as XMLElement;
        expect(suggestedAstNode.type).toEqual("XMLElement");
        expect((suggestedAstNode.parent as XMLElement).name).toEqual("Page");
      },
    });
  });

  describe("isUI5NodeXMLViewCompletion", () => {
    it("returns false for boolean values", () => {
      const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m"
          busy="⇶">
        </mvc:View>`;

      testSuggestionsScenario({
        context: appContext,
        xmlText: xmlSnippet,
        assertion: (suggestions) => {
          forEach(suggestions, (_) => {
            expect(isUI5NodeXMLViewCompletion(_)).toBeFalse();
          });
        },
      });
    });
  });

  describe("filter by settings", () => {
    function testSettingsFilter({
      xmlSnippet,
      suggestionName,
      settings,
      nameIsFQN = false,
    }: {
      xmlSnippet: string;
      suggestionName: string;
      settings: CodeAssistSettings;
      nameIsFQN?: boolean;
    }): void {
      const ALLOW_ALL_SUGGESTIONS = {
        codeAssist: { deprecated: true, experimental: true },
      };

      // Check that it's returned when settings allow experimental
      testSuggestionsScenario({
        xmlText: xmlSnippet,
        context: appContext,
        settings: ALLOW_ALL_SUGGESTIONS,
        assertion: (suggestionsAllAllowed) => {
          const suggestionNamesWithAllAllowed = map(
            suggestionsAllAllowed,
            (_) =>
              nameIsFQN && isUI5NodeXMLViewCompletion(_)
                ? ui5NodeToFQN(_.ui5Node)
                : _.ui5Node.name
          );
          expect(suggestionNamesWithAllAllowed).toIncludeAllMembers([
            suggestionName,
          ]);
        },
      });

      // Check that it's not returned when settings don't allow experimental
      testSuggestionsScenario({
        xmlText: xmlSnippet,
        context: appContext,
        settings: settings,
        assertion: (suggestionsWithSentSettings) => {
          const suggestionNamesWithSentSettings = map(
            suggestionsWithSentSettings,
            (_) =>
              nameIsFQN && isUI5NodeXMLViewCompletion(_)
                ? ui5NodeToFQN(_.ui5Node)
                : _.ui5Node.name
          );
          expect(suggestionNamesWithSentSettings).not.toIncludeAnyMembers([
            suggestionName,
          ]);
        },
      });
    }

    describe("filter experimental items according to settings", () => {
      const NO_EXPERIMENTAL_SUGGESTIONS = {
        codeAssist: { deprecated: true, experimental: false },
      };

      it("will return non-experimental property suggestions when not allowing experimental", () => {
        const xmlSnippet = `
          <mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" busyIndicator⇶>
          </m:View>`;
        testSuggestionsScenario({
          xmlText: xmlSnippet,
          context: appContext,
          settings: NO_EXPERIMENTAL_SUGGESTIONS,
          assertion: (suggestionsWithoutExperimental) => {
            const suggestionNames = map(
              suggestionsWithoutExperimental,
              (_) => _.ui5Node.name
            );
            expect(suggestionNames).toIncludeAllMembers(["busyIndicatorSize"]);
          },
        });
      });

      it("will not return experimental property suggestions according to settings", () => {
        testSettingsFilter({
          xmlSnippet: `
            <mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:widgets="sap.ui.integration.widgets">
              <mvc:content>
                <widgets:Card dataMode⇶
              </mvc:content>
            </m:View>`,
          suggestionName: "dataMode",
          settings: NO_EXPERIMENTAL_SUGGESTIONS,
        });
      });

      it("will not return experimental event suggestions according to settings", () => {
        testSettingsFilter({
          xmlSnippet: `
            <mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:widgets="sap.ui.integration.widgets">
              <mvc:content>
                <widgets:Card action⇶
              </mvc:content>
            </m:View>`,
          suggestionName: "action",
          settings: NO_EXPERIMENTAL_SUGGESTIONS,
        });
      });

      it("will not return experimental association suggestions according to settings", () => {
        testSettingsFilter({
          xmlSnippet: `
            <mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:table="sap.ui.table">
              <mvc:content>
                <table:Table groupBy⇶
              </mvc:content>
            </m:View>`,
          suggestionName: "groupBy",
          settings: NO_EXPERIMENTAL_SUGGESTIONS,
        });
      });

      it("will not return experimental aggregation suggestions according to settings", () => {
        testSettingsFilter({
          xmlSnippet: `
            <mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:commons="sap.suite.ui.commons">
              <mvc:content>
                <commons:ProcessFlowNode>
                  <commons:zoomLevelOneContent⇶
                </commons:ProcessFlowNode> 
              </mvc:content>
            </m:View>`,
          suggestionName: "zoomLevelOneContent",
          settings: NO_EXPERIMENTAL_SUGGESTIONS,
        });
      });

      it("will not return experimental namespace suggestions according to settings", () => {
        testSettingsFilter({
          xmlSnippet: `
            <mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:vtm="sap.ui.vtm⇶">
            </m:View>`,
          suggestionName: "vtm",
          settings: NO_EXPERIMENTAL_SUGGESTIONS,
        });
      });

      it("will not return experimental class suggestions according to settings", () => {
        testSettingsFilter({
          xmlSnippet: `
            <mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:vtm="sap.ui.vtm">
              <mvc:content>
                <Panel⇶
              </mvc:content>
            </m:View>`,
          suggestionName: "sap.ui.vtm.Panel",
          settings: NO_EXPERIMENTAL_SUGGESTIONS,
          nameIsFQN: true,
        });
      });
    });

    describe("filter deprecated items according to settings", () => {
      const NO_DEPRECATED_SUGGESTIONS = {
        codeAssist: { deprecated: false, experimental: true },
      };
      it("will return non-deprecated property suggestions when not allowing deprecated", () => {
        const xmlSnippet = `
          <mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" busyIndicator⇶>
          </m:View>`;
        testSuggestionsScenario({
          xmlText: xmlSnippet,
          context: appContext,
          settings: NO_DEPRECATED_SUGGESTIONS,
          assertion: (suggestionsWithoutDeprecated) => {
            const suggestionNames = map(
              suggestionsWithoutDeprecated,
              (_) => _.ui5Node.name
            );
            expect(suggestionNames).toIncludeAllMembers(["busyIndicatorSize"]);
          },
        });
      });

      it("will not return deprecated property suggestions according to settings", () => {
        testSettingsFilter({
          xmlSnippet: `
            <mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">
              <mvc:content>
                <m:Page icon⇶
              </mvc:content>
            </m:View>`,
          suggestionName: "icon",
          settings: NO_DEPRECATED_SUGGESTIONS,
        });
      });

      it("will not return deprecated event suggestions according to settings", () => {
        testSettingsFilter({
          xmlSnippet: `
            <mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">
              <mvc:content>
                <m:Button tap⇶
              </mvc:content>
            </m:View>`,
          suggestionName: "tap",
          settings: NO_DEPRECATED_SUGGESTIONS,
        });
      });

      it("will not return deprecated association suggestions according to settings", () => {
        testSettingsFilter({
          xmlSnippet: `
          <mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">
              <mvc:content>
                <m:Dialog leftButton⇶
              </mvc:content>
            </m:View>`,
          suggestionName: "leftButton",
          settings: NO_DEPRECATED_SUGGESTIONS,
        });
      });

      it("will not return deprecated aggregation suggestions according to settings", () => {
        testSettingsFilter({
          xmlSnippet: `
            <mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:charts="sap.ca.ui.charts">
              <mvc:content>
                <charts:BubbleChart>
                  <charts:content⇶
                </charts:BubbleChart>
              </mvc:content>
            </m:View>`,
          suggestionName: "content",
          settings: NO_DEPRECATED_SUGGESTIONS,
        });
      });

      it("will not return deprecated namespace suggestions according to settings", () => {
        testSettingsFilter({
          xmlSnippet: `
            <mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.common⇶">
            </m:View>`,
          suggestionName: "commons",
          settings: NO_DEPRECATED_SUGGESTIONS,
        });
      });

      it("will not return deprecated enum value suggestions according to settings", () => {
        testSettingsFilter({
          xmlSnippet: `
            <mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">
              <m:TileContent frameType="TwoThirds⇶"
            </mvc:View>`,
          suggestionName: "TwoThirds",
          settings: NO_DEPRECATED_SUGGESTIONS,
        });
      });

      it("will not return deprecated class suggestions according to settings", () => {
        testSettingsFilter({
          xmlSnippet: `
            <mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:commons="sap.ui.commons">
              <mvc:content>
                <MenuButton⇶
              </mvc:content>
            </m:View>`,
          suggestionName: "sap.ui.commons.MenuButton",
          settings: NO_DEPRECATED_SUGGESTIONS,
          nameIsFQN: true,
        });
      });
    });
  });

  it("will return true and false when settings don't allow deprecated and experimental APIs", () => {
    const NO_DEPRECATED_OR_EXPERIMENTAL = {
      codeAssist: { deprecated: false, experimental: false },
    };
    const xmlSnippet = `
      <mvc:View 
        xmlns:mvc="sap.ui.core.mvc" 
        xmlns="sap.m"
        busy="⇶">`;
    testSuggestionsScenario({
      xmlText: xmlSnippet,
      context: appContext,
      settings: NO_DEPRECATED_OR_EXPERIMENTAL,
      assertion: (suggestions) => {
        const suggestionNames = map(suggestions, (_) => _.ui5Node.name);
        expect(suggestionNames).toIncludeSameMembers(["true", "false"]);
      },
    });
  });
});

export function testSuggestionsScenario(opts: {
  xmlText: string;
  context: AppContext;
  settings?: CodeAssistSettings;
  assertion: (suggestions: UI5XMLViewCompletion[]) => void;
}): void {
  const realXmlText = opts.xmlText.replace("⇶", "");
  const offset = opts.xmlText.indexOf("⇶");
  const { cst, tokenVector } = parse(realXmlText);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);

  let settings = opts.settings;
  if (settings === undefined) {
    // In the tests - show experimental and deprecated by default
    settings = { codeAssist: { deprecated: true, experimental: true } };
  }

  const suggestions = getXMLViewCompletions({
    offset: offset,
    cst: cst as DocumentCstNode,
    ast: ast,
    tokenVector: tokenVector,
    context: opts.context,
    settings: settings,
  });

  opts.assertion(suggestions);
}

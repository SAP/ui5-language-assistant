import { expect } from "chai";
import { UI5SemanticModel } from "@vscode-ui5/semantic-model-types";
import { map } from "lodash";

import { testSuggestionsScenario } from "../../utils";
import { aggregationSuggestions } from "../../../src/providers/elementName/aggregation";
import { XMLElement } from "@xml-tools/ast";
import { generateModel } from "@vscode-ui5/test-utils";

const ui5SemanticModel: UI5SemanticModel = generateModel();

describe("The ui5-vscode xml-views-completion", () => {
  context("aggregations", () => {
    it("will suggest direct aggregations", () => {
      const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <Page>
            <⇶
          </Page>
        </mvc:View>`;

      testSuggestionsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        providers: {
          elementName: [aggregationSuggestions]
        },
        assertion: suggestions => {
          const suggestedNames = map(suggestions, _ => _.ui5Node.name);
          expect(suggestedNames).to.include.members([
            "content",
            "customHeader",
            "footer",
            "headerContent",
            "landmarkInfo",
            "subHeader"
          ]);

          const suggestedAstNode = suggestions[0].astNode as XMLElement;
          expect(suggestedAstNode.type).to.equal("XMLElement");
          expect((suggestedAstNode.parent as XMLElement).name).to.equal("Page");
        }
      });
    });

    it("will suggest borrowed aggregations", () => {
      const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <Page>
            <⇶
          </Page>
        </mvc:View>`;

      testSuggestionsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        providers: {
          elementName: [aggregationSuggestions]
        },
        assertion: suggestions => {
          const suggestedNames = map(suggestions, _ => _.ui5Node.name);
          expect(suggestedNames).to.include.members([
            "customData",
            "dependents",
            "dragDropConfig",
            "layoutData",
            "tooltip"
          ]);

          const suggestedAstNode = suggestions[0].astNode as XMLElement;
          expect(suggestedAstNode.type).to.equal("XMLElement");
          expect((suggestedAstNode.parent as XMLElement).name).to.equal("Page");
        }
      });
    });

    it("will not suggest pre-existing aggregations", () => {
      const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <Page>
            <content></content>
            <customHeader></customHeader>
            <footer></footer>
            <⇶
          </Page>
        </mvc:View>`;

      testSuggestionsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        providers: {
          elementName: [aggregationSuggestions]
        },
        assertion: suggestions => {
          const suggestedNames = map(suggestions, _ => _.ui5Node.name);
          expect(suggestedNames).to.not.include.members([
            "content",
            "customHeader",
            "footer"
          ]);
        }
      });
    });

    it("will filter suggestions on prefix (true prefix)", () => {
      const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <Page>
            <cu⇶
          </Page>
        </mvc:View>`;

      testSuggestionsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        providers: {
          elementName: [aggregationSuggestions]
        },
        assertion: suggestions => {
          const suggestedNames = map(suggestions, _ => _.ui5Node.name);
          expect(suggestedNames).to.include.members([
            "customData",
            "customHeader"
          ]);

          expect(suggestedNames).to.not.include.members([
            "content",
            "dependents",
            "dragDropConfig",
            "footer",
            "headerContent",
            "landmarkInfo",
            "layoutData",
            "subHeader",
            "tooltip"
          ]);
        }
      });
    });

    it("will filter suggestions on prefix (contains)", () => {
      const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <Page>
            <Data⇶
          </Page>
        </mvc:View>`;

      testSuggestionsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        providers: {
          elementName: [aggregationSuggestions]
        },
        assertion: suggestions => {
          const suggestedNames = map(suggestions, _ => _.ui5Node.name);
          expect(suggestedNames).to.include.members([
            "customData",
            "layoutData"
          ]);

          expect(suggestedNames).to.not.include.members([
            "content",
            "customHeader",
            "dependents",
            "dragDropConfig",
            "footer",
            "headerContent",
            "landmarkInfo",
            "subHeader",
            "tooltip"
          ]);
        }
      });
    });
  });
});

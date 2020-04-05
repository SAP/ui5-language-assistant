import { expect } from "chai";
import { forEach, map } from "lodash";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  generateModel,
  GEN_MODEL_TIMEOUT
} from "@ui5-language-assistant/test-utils";
import { testSuggestionsScenario } from "../../utils";
import { enumSuggestions } from "../../../src/providers/attributeValue/enum";
import { UI5XMLViewCompletion } from "../../../api";
import { XMLAttribute, XMLElement } from "@xml-tools/ast";

describe("The ui5-language-assistant xml-views-completion", () => {
  let ui5SemanticModel: UI5SemanticModel;
  before(async function() {
    this.timeout(GEN_MODEL_TIMEOUT);
    ui5SemanticModel = await generateModel("1.74.0");
  });

  context("enum values", () => {
    context("applicable scenarios", () => {
      it("will suggest enum values with no prefix provided", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
            <List showSeparators = "⇶">
            </List>
          </mvc:View>`;

        testSuggestionsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [enumSuggestions]
          },
          assertion: suggestions => {
            const suggestedValues = map(suggestions, _ => _.ui5Node.name);
            expect(suggestedValues).to.deep.equalInAnyOrder([
              "All",
              "Inner",
              "None"
            ]);
            expectEnumValuesSuggestions(suggestions, "List");
          }
        });
      });

      it("will suggest enum values filtered by prefix", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
            <List showSeparators = "n⇶">
            </List>
          </mvc:View>`;

        testSuggestionsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [enumSuggestions]
          },
          assertion: suggestions => {
            const suggestedValues = map(suggestions, _ => _.ui5Node.name);
            expect(suggestedValues).to.deep.equalInAnyOrder(["Inner", "None"]);
            expectEnumValuesSuggestions(suggestions, "List");
          }
        });
      });

      it("Will not suggest any enum values if none match the prefix", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
            <List showSeparators = "j⇶">
            </List>
          </mvc:View>`;

        testSuggestionsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [enumSuggestions]
          },
          assertion: suggestions => {
            expect(suggestions).to.be.empty;
          }
        });
      });
    });

    context("none applicable scenarios", () => {
      it("will not provide any suggestions when the property is not of enum type", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
            <List showNoData = "⇶">
            </List>
          </mvc:View>`;

        testSuggestionsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [enumSuggestions]
          },
          assertion: suggestions => {
            expect(suggestions).to.be.empty;
          }
        });
      });

      it("will not provide any suggestions when it is not an attribute value completion", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
            <List ⇶>
            </List>
          </mvc:View>`;

        testSuggestionsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [enumSuggestions]
          },
          assertion: suggestions => {
            expect(suggestions).to.be.empty;
          }
        });
      });

      it("will not provide any suggestions when the property type is undefined", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
            <App homeIcon = "⇶">
            </App>
          </mvc:View>`;

        testSuggestionsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [enumSuggestions]
          },
          assertion: suggestions => {
            expect(suggestions).to.be.empty;
          }
        });
      });

      it("will not provide any suggestions when not inside a UI5 Class", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
            <Bamba foo = "⇶">
            </Bamba>
          </mvc:View>`;

        testSuggestionsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [enumSuggestions]
          },
          assertion: suggestions => {
            expect(ui5SemanticModel.classes["sap.ui.core.mvc.Bamba"]).to.be
              .undefined;
            expect(suggestions).to.be.empty;
          }
        });
      });

      it("Will not suggest any enum values if there is no matching UI5 property", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
            <List UNKNOWN = "⇶">
            </List>
          </mvc:View>`;

        testSuggestionsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [enumSuggestions]
          },
          assertion: suggestions => {
            expect(suggestions).to.be.empty;
          }
        });
      });
    });
  });
});

function expectEnumValuesSuggestions(
  suggestions: UI5XMLViewCompletion[],
  expectedParentTag: string
): void {
  forEach(suggestions, _ => {
    expect(_.type).to.equal(`UI5EnumsInXMLAttributeValue`);
    expect((_.astNode as XMLAttribute).key).to.equal("showSeparators");
    expect((_.astNode.parent as XMLElement).name).to.equal(expectedParentTag);
  });
}

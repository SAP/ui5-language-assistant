import { expect } from "chai";
import { forEach, map } from "lodash";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  generateModel,
  GEN_MODEL_TIMEOUT
} from "@ui5-language-assistant/test-utils";
import { testSuggestionsScenario, asserLiteralCompletions } from "../../utils";
import { booleanSuggestions } from "../../../src/providers/attributeValue/literal";
import { UI5XMLViewCompletion } from "../../../api";
import { isUI5NodeXMLViewCompletion } from "../../../src/api";
import { XMLAttribute, XMLElement } from "@xml-tools/ast";

describe("The ui5-language-assistant xml-views-completion", () => {
  let ui5SemanticModel: UI5SemanticModel;
  before(async function() {
    this.timeout(GEN_MODEL_TIMEOUT);
    ui5SemanticModel = await generateModel({ version: "1.74.0" });
  });

  context("boolean values", () => {
    context("isUI5NodeXMLViewCompletion", () => {
      it("returns false for boolean values", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            busy="⇶">
          </mvc:View>`;

        testSuggestionsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [booleanSuggestions]
          },
          assertion: suggestions => {
            forEach(suggestions, _ => {
              expect(isUI5NodeXMLViewCompletion(_)).to.be.false;
            });
          }
        });
      });
    });

    context("applicable scenarios", () => {
      it("will suggest boolean values with no prefix provided", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            busy="⇶">
          </mvc:View>`;

        testSuggestionsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [booleanSuggestions]
          },
          assertion: suggestions => {
            asserLiteralCompletions(suggestions);
            const suggestedValues = map(suggestions, _ => ({
              name: _.name,
              value: _.value
            }));
            expect(suggestedValues).to.deep.equalInAnyOrder([
              { name: "false", value: false },
              { name: "true", value: true }
            ]);
            expectBooleanSuggestions(suggestions, "View");
          }
        });
      });

      it("will suggest enum values filtered by prefix", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m"
          busy="t⇶">
        </mvc:View>`;

        testSuggestionsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [booleanSuggestions]
          },
          assertion: suggestions => {
            asserLiteralCompletions(suggestions);
            const suggestedValues = map(suggestions, _ => ({
              name: _.name,
              value: _.value
            }));
            expect(suggestedValues).to.deep.equalInAnyOrder([
              { name: "true", value: true }
            ]);
            expectBooleanSuggestions(suggestions, "View");
          }
        });
      });

      it("Will not suggest any enum values if none match the prefix", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m"
          busy="aaa⇶">
        </mvc:View>`;

        testSuggestionsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [booleanSuggestions]
          },
          assertion: suggestions => {
            expect(suggestions).to.be.empty;
          }
        });
      });
    });

    context("non-applicable scenarios", () => {
      it("will not provide any suggestions when the property is not of boolean type", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            busyIndicatorSize="⇶">
          </mvc:View>`;

        testSuggestionsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [booleanSuggestions]
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
            attributeValue: [booleanSuggestions]
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
            attributeValue: [booleanSuggestions]
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
            attributeValue: [booleanSuggestions]
          },
          assertion: suggestions => {
            expect(ui5SemanticModel.classes["sap.ui.core.mvc.Bamba"]).to.be
              .undefined;
            expect(suggestions).to.be.empty;
          }
        });
      });

      it("Will not suggest any boolean values if the property is unknown", () => {
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
            attributeValue: [booleanSuggestions]
          },
          assertion: suggestions => {
            expect(suggestions).to.be.empty;
          }
        });
      });
    });
  });
});

function expectBooleanSuggestions(
  suggestions: UI5XMLViewCompletion[],
  expectedParentTag: string
): void {
  forEach(suggestions, _ => {
    expect(_.type).to.equal("BooleanValueInXMLAttributeValueCompletion");
    expect((_.astNode as XMLAttribute).key).to.equal("busy");
    expect((_.astNode.parent as XMLElement).name).to.equal(expectedParentTag);
  });
}

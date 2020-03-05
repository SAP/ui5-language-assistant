import { expect } from "chai";
import { map } from "lodash";
import { XMLElement, XMLAttribute } from "@xml-tools/ast";
import { UI5SemanticModel } from "@vscode-ui5/semantic-model-types";
import { generateModel } from "@vscode-ui5/test-utils";
import { testSuggestionsScenario } from "../../utils";
import { enumSuggestions } from "../../../src/providers/attributeValue/enum";

const ui5SemanticModel: UI5SemanticModel = generateModel("1.74.0");

describe("The ui5-vscode xml-views-completion", () => {
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
            expect((suggestions[0].astNode as XMLAttribute).key).to.equal(
              "showSeparators"
            );
            expect((suggestions[0].astNode.parent as XMLElement).name).to.equal(
              "List"
            );
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
            expect((suggestions[0].astNode as XMLAttribute).key).to.equal(
              "showSeparators"
            );
            expect((suggestions[0].astNode.parent as XMLElement).name).to.equal(
              "List"
            );
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

    context("not applicable scenarios", () => {
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

      it("will not provide any suggestions when the property type has an undefined type, it won't be applicable enum suggestion", () => {
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
    });
  });
});

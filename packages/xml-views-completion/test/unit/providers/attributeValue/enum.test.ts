import { forEach, map } from "lodash";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { generateModel } from "@ui5-language-assistant/test-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import { XMLAttribute, XMLElement } from "@xml-tools/ast";
import { enumSuggestions } from "../../../../src/providers/attributeValue/enum";
import { UI5XMLViewCompletion } from "../../../../api";
import { getDefaultContext, testSuggestionsScenario } from "../../utils";
import { Context as AppContext } from "@ui5-language-assistant/context";

describe("The ui5-language-assistant xml-views-completion", () => {
  let ui5SemanticModel: UI5SemanticModel;
  let appContext: AppContext;
  beforeAll(async function () {
    ui5SemanticModel = await generateModel({
      framework: "SAPUI5",
      version: "1.71.60",
      modelGenerator: generate,
    });
    appContext = getDefaultContext(ui5SemanticModel);
  });

  describe("enum values", () => {
    describe("applicable scenarios", () => {
      it("will suggest enum values with no prefix provided", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
            <List showSeparators = "⇶">
            </List>
          </mvc:View>`;

        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [enumSuggestions],
          },
          assertion: (suggestions) => {
            const suggestedValues = map(suggestions, (_) => _.ui5Node.name);
            expect(suggestedValues).toIncludeSameMembers([
              "All",
              "Inner",
              "None",
            ]);
            expectEnumValuesSuggestions(suggestions, "List");
          },
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
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [enumSuggestions],
          },
          assertion: (suggestions) => {
            const suggestedValues = map(suggestions, (_) => _.ui5Node.name);
            expect(suggestedValues).toIncludeSameMembers(["Inner", "None"]);
            expectEnumValuesSuggestions(suggestions, "List");
          },
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
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [enumSuggestions],
          },
          assertion: (suggestions) => {
            expect(suggestions).toBeEmpty();
          },
        });
      });
    });

    describe("none applicable scenarios", () => {
      it("will not provide any suggestions when the property is not of enum type", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
            <List showNoData = "⇶">
            </List>
          </mvc:View>`;

        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [enumSuggestions],
          },
          assertion: (suggestions) => {
            expect(suggestions).toBeEmpty();
          },
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
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [enumSuggestions],
          },
          assertion: (suggestions) => {
            expect(suggestions).toBeEmpty();
          },
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
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [enumSuggestions],
          },
          assertion: (suggestions) => {
            expect(suggestions).toBeEmpty();
          },
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
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [enumSuggestions],
          },
          assertion: (suggestions) => {
            expect(
              ui5SemanticModel.classes["sap.ui.core.mvc.Bamba"]
            ).toBeUndefined();
            expect(suggestions).toBeEmpty();
          },
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
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [enumSuggestions],
          },
          assertion: (suggestions) => {
            expect(suggestions).toBeEmpty();
          },
        });
      });
    });
  });
});

function expectEnumValuesSuggestions(
  suggestions: UI5XMLViewCompletion[],
  expectedParentTag: string
): void {
  forEach(suggestions, (_) => {
    expect(_.type).toEqual(`UI5EnumsInXMLAttributeValue`);
    expect((_.astNode as XMLAttribute).key).toEqual("showSeparators");
    expect((_.astNode.parent as XMLElement).name).toEqual(expectedParentTag);
  });
}

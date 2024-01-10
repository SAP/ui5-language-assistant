import { difference, forEach, partial } from "lodash";
import { XMLAttribute } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { generate } from "@ui5-language-assistant/semantic-model";
import {
  DEFAULT_UI5_VERSION,
  expectSuggestions,
  expectXMLAttribute,
  generateModel,
  getFallbackPatchVersions,
} from "@ui5-language-assistant/test-utils";
import { propEventAssocSuggestions } from "../../../../src/providers/attributeName/prop-event-assoc";
import { UI5XMLViewCompletion } from "../../../../api";
import { getDefaultContext, testSuggestionsScenario } from "../../utils";
import { Context as AppContext } from "@ui5-language-assistant/context";

const uiCoreControlProperties = [
  "blocked",
  "busy",
  "busyIndicatorDelay",
  "busyIndicatorSize",
  "fieldGroupIds",
  "visible",
];
const uiCoreControlEvents = [
  "validateFieldGroup",
  "formatError",
  "modelContextChange",
  "parseError",
  "validationError",
  "validationSuccess",
];
const radioButtonGroupProperties = [
  "columns",
  "editable",
  "enabled",
  "selectedIndex",
  "textDirection",
  "valueState",
  "width",
];

const radioButtonGroupSpecialProperties = [
  "id",
  "models",
  "bindingContexts",
  "objectBindings",
  "metadataContexts",
  "Type",
];

const radioButtonGroupEvents = ["select"];
const uiCoreControlAssociations = ["ariaDescribedBy", "ariaLabelledBy"];
const allPropsEventsAssociations = uiCoreControlProperties
  .concat(uiCoreControlEvents)
  .concat(uiCoreControlAssociations)
  .concat(radioButtonGroupProperties)
  .concat(radioButtonGroupSpecialProperties)
  .concat(radioButtonGroupEvents);

describe("The ui5-language-assistant xml-views-completion", () => {
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

  describe("properties, events and associations", () => {
    describe("applicable scenarios", () => {
      it("will suggest when no prefix provided", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <RadioButtonGroup ⇶>
          </RadioButtonGroup>
        </mvc:View>`;
        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeName: [propEventAssocSuggestions],
          },
          assertion: (suggestions) => {
            expectAttributesSuggestions({
              suggestions,
              expectedSuggestionsNames: allPropsEventsAssociations,
              expectedParentTag: "RadioButtonGroup",
            });
            const suggestedAstNode = suggestions[0].astNode as XMLAttribute;
            expect(suggestedAstNode.position.startLine).toEqual(-1);
          },
        });
      });

      it("will suggest special properties", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <RadioButtonGroup metada⇶>
          </RadioButtonGroup>
        </mvc:View>`;
        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeName: [propEventAssocSuggestions],
          },
          assertion: (suggestions) => {
            expectAttributesSuggestions({
              suggestions,
              expectedSuggestionsNames: ["metadataContexts"],
              expectedParentTag: "RadioButtonGroup",
            });
          },
        });
      });

      it("will filter suggestions by prefix", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <RadioButtonGroup bu⇶>
          </RadioButtonGroup>
        </mvc:View>`;
        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeName: [propEventAssocSuggestions],
          },
          assertion: (suggestions) => {
            expectAttributesSuggestions({
              suggestions,
              expectedSuggestionsNames: [
                "busy",
                "busyIndicatorDelay",
                "busyIndicatorSize",
              ],
              expectedParentTag: "RadioButtonGroup",
            });
          },
        });
      });

      it("will suggest the current attribute when only attribute name exists", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <RadioButtonGroup busy⇶>
          </RadioButtonGroup>
        </mvc:View>`;
        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeName: [propEventAssocSuggestions],
          },
          assertion: (suggestions) => {
            expectAttributesSuggestions({
              suggestions,
              expectedSuggestionsNames: [
                "busy",
                "busyIndicatorDelay",
                "busyIndicatorSize",
              ],
              expectedParentTag: "RadioButtonGroup",
            });
          },
        });
      });

      it("will suggest the current attribute when attribute value exists", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <RadioButtonGroup busy⇶="true">
          </RadioButtonGroup>
        </mvc:View>`;
        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeName: [propEventAssocSuggestions],
          },
          assertion: (suggestions) => {
            expectAttributesSuggestions({
              suggestions,
              expectedSuggestionsNames: [
                "busy",
                "busyIndicatorDelay",
                "busyIndicatorSize",
              ],
              expectedParentTag: "RadioButtonGroup",
            });
          },
        });
      });

      it("will filter suggestions by pre-existing attributes", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <RadioButtonGroup ⇶ busy="true">
          </RadioButtonGroup>
        </mvc:View>`;
        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeName: [propEventAssocSuggestions],
          },
          assertion: (suggestions) => {
            const expectedSuggestionsNames = difference(
              allPropsEventsAssociations,
              ["busy"]
            );
            expectAttributesSuggestions({
              suggestions,
              expectedSuggestionsNames,
              expectedParentTag: "RadioButtonGroup",
            });
          },
        });
      });

      it("will filter suggestions by both pre-existing and prefix", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <RadioButtonGroup busy="true" bu⇶>
          </RadioButtonGroup>
        </mvc:View>`;
        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeName: [propEventAssocSuggestions],
          },
          assertion: (suggestions) => {
            expectAttributesSuggestions({
              suggestions,
              expectedSuggestionsNames: [
                "busyIndicatorDelay",
                "busyIndicatorSize",
              ],
              expectedParentTag: "RadioButtonGroup",
            });
          },
        });
      });
    });

    describe("not applicable scenarios", () => {
      it("will not suggest for unknown UI5 class", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <Unknown busy="true" b⇶>
          </Unknown>
        </mvc:View>`;
        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeName: [propEventAssocSuggestions],
          },
          assertion: (suggestions) => {
            expect(suggestions).toBeEmpty();
          },
        });
      });

      it("Will not suggest for a UI5 class which does not extend sap.ui.core.Element", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.ui.core">
          <Element busy="true" b⇶>
          </Element>
        </mvc:View>`;
        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeName: [propEventAssocSuggestions],
          },
          assertion: (suggestions) => {
            expect(suggestions).toBeEmpty();
          },
        });
      });
    });
  });
});

const expectAttributesNames = partial(expectSuggestions, (_) => _.ui5Node.name);

function expectAttributesSuggestions({
  suggestions,
  expectedSuggestionsNames,
  expectedParentTag,
}: {
  suggestions: UI5XMLViewCompletion[];
  expectedSuggestionsNames: string[];
  expectedParentTag: string;
}): void {
  expectAttributesNames(suggestions, expectedSuggestionsNames);
  forEach(suggestions, (_) => {
    expectXMLAttribute(_.astNode);
    expect(_.astNode.parent.name).toEqual(expectedParentTag);
    expect(_.type).toEqual(`${_.ui5Node.kind}sInXMLAttributeKey`);
  });
}

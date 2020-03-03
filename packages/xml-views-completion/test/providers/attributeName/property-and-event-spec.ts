import { expect } from "chai";
import { UI5SemanticModel } from "@vscode-ui5/semantic-model-types";
import { map, difference } from "lodash";

import { testSuggestionsScenario } from "../../utils";
import { expectUnsortedEquality, generateModel } from "@vscode-ui5/test-utils";
import { propertyAndEventSuggestions } from "../../../src/providers/attributeName/property-and-event";
import { XMLAttribute, XMLElement } from "@xml-tools/ast";
import { XMLViewCompletion } from "../../../api";

const ui5SemanticModel: UI5SemanticModel = generateModel("1.74.0");

const uiCoreControlProperties = [
  "blocked",
  "busy",
  "busyIndicatorDelay",
  "busyIndicatorSize",
  "fieldGroupIds",
  "visible"
];
const uiCoreControlEvents = [
  "validateFieldGroup",
  "formatError",
  "modelContextChange",
  "parseError",
  "validationError",
  "validationSuccess"
];
const radioButtonGroupProperties = [
  "columns",
  "editable",
  "enabled",
  "selectedIndex",
  "textDirection",
  "valueState",
  "width"
];
const radioButtonGroupEvents = ["select"];
const allPropertiesAndEvents = uiCoreControlProperties
  .concat(uiCoreControlEvents)
  .concat(radioButtonGroupProperties)
  .concat(radioButtonGroupEvents);

describe("The ui5-vscode xml-views-completion", () => {
  context("properties and events", () => {
    context("applicable scenarios", () => {
      it("will suggest when no prefix provided", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <RadioButtonGroup ⇶>
          </RadioButtonGroup>
        </mvc:View>`;
        testSuggestionsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeName: [propertyAndEventSuggestions]
          },
          assertion: suggestions => {
            expectAttributesSuggestions(suggestions, allPropertiesAndEvents);
            const suggestedAstNode = suggestions[0].astNode as XMLAttribute;
            expect(suggestedAstNode.position.startLine).to.equal(-1);
          }
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
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeName: [propertyAndEventSuggestions]
          },
          assertion: suggestions => {
            expectAttributesSuggestions(suggestions, [
              "busy",
              "busyIndicatorDelay",
              "busyIndicatorSize"
            ]);
          }
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
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeName: [propertyAndEventSuggestions]
          },
          assertion: suggestions => {
            const expectedSuggestions = difference(allPropertiesAndEvents, [
              "busy"
            ]);
            expectAttributesSuggestions(suggestions, expectedSuggestions);
          }
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
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeName: [propertyAndEventSuggestions]
          },
          assertion: suggestions => {
            expectAttributesSuggestions(suggestions, [
              "busyIndicatorDelay",
              "busyIndicatorSize"
            ]);
          }
        });
      });
    });

    context("not applicable scenarios", () => {
      it("will not suggest for unknown UI5 class", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <Unknown busy="true" b⇶>
          </Unknown>
        </mvc:View>`;
        testSuggestionsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeName: [propertyAndEventSuggestions]
          },
          assertion: suggestions => {
            expect(suggestions).to.be.empty;
          }
        });
      });

      it("Will not suggest for a UI5 class which does not extend sap.ui.core.Control", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.ui.core">
          <Control busy="true" b⇶>
          </Control>
        </mvc:View>`;
        testSuggestionsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeName: [propertyAndEventSuggestions]
          },
          assertion: suggestions => {
            expect(suggestions).to.be.empty;
          }
        });
      });
    });
  });
});

function expectAttributesSuggestions(
  suggestions: XMLViewCompletion[],
  expected: string[]
): void {
  const suggestedNames = map(suggestions, _ => _.ui5Node.name);
  expectUnsortedEquality(suggestedNames, expected);
  const suggestedAstNode = suggestions[0].astNode as XMLAttribute;
  expect(suggestedAstNode.type).to.equal("XMLAttribute");
  expect((suggestedAstNode.parent as XMLElement).name).to.equal(
    "RadioButtonGroup"
  );
}

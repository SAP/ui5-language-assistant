import { expect } from "chai";
import { difference, forEach, partial } from "lodash";
import { XMLAttribute } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-editor-tools/semantic-model-types";
import {
  expectSuggestions,
  expectXMLAttribute,
  generateModel
} from "@ui5-editor-tools/test-utils";
import { UI5XMLViewCompletion } from "../../../api";
import { propEventAssocSuggestions } from "../../../src/providers/attributeName/prop-event-assoc";
import { testSuggestionsScenario } from "../../utils";

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
const uiCoreControlAssociations = ["ariaDescribedBy", "ariaLabelledBy"];
const allPropsEventsAssociations = uiCoreControlProperties
  .concat(uiCoreControlEvents)
  .concat(uiCoreControlAssociations)
  .concat(radioButtonGroupProperties)
  .concat(radioButtonGroupEvents);

describe("The ui5-editor-tools xml-views-completion", () => {
  context("properties, events and associations", () => {
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
            attributeName: [propEventAssocSuggestions]
          },
          assertion: suggestions => {
            expectAttributesSuggestions(
              suggestions,
              allPropsEventsAssociations
            );
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
            attributeName: [propEventAssocSuggestions]
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
            attributeName: [propEventAssocSuggestions]
          },
          assertion: suggestions => {
            const expectedSuggestions = difference(allPropsEventsAssociations, [
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
            attributeName: [propEventAssocSuggestions]
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
            attributeName: [propEventAssocSuggestions]
          },
          assertion: suggestions => {
            expect(suggestions).to.be.empty;
          }
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
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeName: [propEventAssocSuggestions]
          },
          assertion: suggestions => {
            expect(suggestions).to.be.empty;
          }
        });
      });
    });
  });
});

const expectAttributesNames = partial(expectSuggestions, _ => _.ui5Node.name);

function expectAttributesSuggestions(
  suggestions: UI5XMLViewCompletion[],
  expected: string[]
): void {
  expectAttributesNames(suggestions, expected);
  forEach(suggestions, _ => {
    expectXMLAttribute(_.astNode);
    expect(_.astNode.parent.name).to.equal("RadioButtonGroup");
    expect(_.type).to.equal(`${_.ui5Node.kind}sInXMLAttributeKey`);
  });
}

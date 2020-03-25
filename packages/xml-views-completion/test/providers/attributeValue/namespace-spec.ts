import { createXMLAttribute, testSuggestionsScenario } from "../../utils";
import { UI5SemanticModel } from "@ui5-editor-tools/semantic-model-types";
import { generateModel } from "@ui5-editor-tools/test-utils";
import { namespaceValueSuggestions } from "../../../src/providers/attributeValue/namespace";
import { expectNamespaceKeysSuggestions } from "../attributeName/namespace-spec";
import { expect } from "chai";
import { XMLAttribute } from "@xml-tools/ast";

const ui5SemanticModel: UI5SemanticModel = generateModel("1.74.0");

describe("The ui5-editor-tools xml-views-completion", () => {
  context("namespaces values", () => {
    context("applicable scenarios", () => {
      it("will suggest namespace values with no prefix provided", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="table⇶">
          </mvc:View>`;

        testSuggestionsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [namespaceValueSuggestions]
          },
          assertion: suggestions => {
            expectNamespaceKeysSuggestions(suggestions, [
              "sap.ui.table",
              "sap.ui.table.plugins",
              "sap.ui.table.rowmodes"
            ]);
          }
        });
      });

      it("will suggest namespace values with prefix provided and null attribute value", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns:dnd="⇶">
          </mvc:View>`;

        testSuggestionsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [namespaceValueSuggestions]
          },
          assertion: suggestions => {
            expectNamespaceKeysSuggestions(suggestions, [
              "sap.ui.core.dnd",
              "sap.f.dnd"
            ]);
          }
        });
      });

      it("will suggest namespace values with no prefix provided", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns:rowmodes="table⇶">
          </mvc:View>`;

        testSuggestionsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [namespaceValueSuggestions]
          },
          assertion: suggestions => {
            expectNamespaceKeysSuggestions(suggestions, [
              "sap.ui.table.rowmodes"
            ]);
          }
        });
      });

      it("will suggest namespace values with prefix provided that no namespace ends with it", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns:abc="table⇶">
          </mvc:View>`;

        testSuggestionsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [namespaceValueSuggestions]
          },
          assertion: suggestions => {
            expectNamespaceKeysSuggestions(suggestions, [
              "sap.ui.table",
              "sap.ui.table.plugins",
              "sap.ui.table.rowmodes"
            ]);
          }
        });
      });

      it("will suggest namespace values in exploration mode", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.core.⇶">
          </mvc:View>`;

        testSuggestionsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [namespaceValueSuggestions]
          },
          assertion: suggestions => {
            expectNamespaceKeysSuggestions(suggestions, [
              "sap.ui.core.dnd",
              "sap.ui.core.mvc",
              "sap.ui.core.search",
              "sap.ui.core.tmpl",
              "sap.ui.core.util"
            ]);
          }
        });
      });
    });

    context("non applicable scenarios", () => {
      it("will not suggest when used on element that is not View", () => {
        const xmlSnippet = `
        <mvc:Controller
          xmlns:mvc="sap.ui.core.mvc"
          xmlns:rowmodes="sap.⇶">
        </mvc:Controller>`;

        testSuggestionsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [namespaceValueSuggestions]
          },
          assertion: suggestions => {
            expect(suggestions).to.be.empty;
          }
        });
      });

      it("will not suggest when used on undefined class", () => {
        const xmlSnippet = `
        <mvc:Controller1
          xmlns:mvc="sap.ui.core⇶">
        </mvc:Controller1>`;

        testSuggestionsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [namespaceValueSuggestions]
          },
          assertion: suggestions => {
            expect(suggestions).to.be.empty;
          }
        });
      });
    });

    context("not reproducible scenarios", () => {
      it("will not suggest when attribute key is null", () => {
        const xmlAttribute = createXMLAttribute("dummy", null, null);
        const suggestions = namespaceValueSuggestions({
          attribute: xmlAttribute,
          context: ui5SemanticModel,
          element: xmlAttribute.parent,
          prefix: ""
        });
        expect(suggestions).to.be.empty;
      });

      it("will suggest when attribute value is null", () => {
        const xmlAttribute = createXMLAttribute("dummy", "xmlns:table", null);
        const suggestions = namespaceValueSuggestions({
          attribute: xmlAttribute,
          context: ui5SemanticModel,
          element: xmlAttribute.parent,
          prefix: ""
        });
        expectNamespaceKeysSuggestions(suggestions, ["sap.ui.table"]);
      });
    });
  });
});

import { partial } from "lodash";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { ui5NodeToFQN } from "@ui5-language-assistant/logic-utils";
import { UI5NamespacesInXMLAttributeValueCompletion } from "@ui5-language-assistant/xml-views-completion";
import { generate } from "@ui5-language-assistant/semantic-model";
import {
  DEFAULT_UI5_VERSION,
  expectSuggestions,
  expectXMLAttribute,
  generateModel,
  getFallbackPatchVersions,
} from "@ui5-language-assistant/test-utils";
import { namespaceValueSuggestions } from "../../../../src/providers/attributeValue/namespace";
import {
  createXMLAttribute,
  getDefaultContext,
  testSuggestionsScenario,
} from "../../utils";
import { expectUI5Namespace } from "../attributeName/namespace.test";
import { Context as AppContext } from "@ui5-language-assistant/context";

const expectNamespaceValuesSuggestions = partial(expectSuggestions, (_) => {
  expect(_.type).toEqual("UI5NamespacesInXMLAttributeValue");
  const namespaceSuggestion = _ as UI5NamespacesInXMLAttributeValueCompletion;
  expectUI5Namespace(namespaceSuggestion.ui5Node);
  expectXMLAttribute(namespaceSuggestion.astNode);
  return ui5NodeToFQN(namespaceSuggestion.ui5Node);
});

describe("The ui5-editor-tools xml-views-completion", () => {
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

  describe("namespaces values", () => {
    describe("applicable scenarios", () => {
      it("will suggest namespace values with no prefix provided", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="table⇶">
          </mvc:View>`;

        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [namespaceValueSuggestions],
          },
          assertion: (suggestions) => {
            expectNamespaceValuesSuggestions(suggestions, [
              "sap.ui.table",
              "sap.ui.table.plugins",
              "sap.ui.table.rowmodes",
              "sap.ui.comp.smarttable",
            ]);
          },
        });
      });

      it("will suggest namespace values with prefix provided and empty attribute value", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns:dnd="⇶">
          </mvc:View>`;

        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [namespaceValueSuggestions],
          },
          assertion: (suggestions) => {
            expectNamespaceValuesSuggestions(suggestions, [
              "sap.ui.core.dnd",
              "sap.f.dnd",
            ]);
          },
        });
      });

      it("will suggest namespace values with key prefix and partial attribute value provided", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns:rowmodes="table⇶">
          </mvc:View>`;

        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [namespaceValueSuggestions],
          },
          assertion: (suggestions) => {
            expectNamespaceValuesSuggestions(suggestions, [
              "sap.ui.table.rowmodes",
            ]);
          },
        });
      });

      it("will suggest namespace values without filtering by prefix when no namespace short name equals to prefix", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns:abc="table⇶">
          </mvc:View>`;

        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [namespaceValueSuggestions],
          },
          assertion: (suggestions) => {
            expectNamespaceValuesSuggestions(suggestions, [
              "sap.ui.table",
              "sap.ui.table.plugins",
              "sap.ui.table.rowmodes",
              "sap.ui.comp.smarttable",
            ]);
          },
        });
      });

      it("will suggest namespace values in exploration mode", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.core.⇶">
          </mvc:View>`;

        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [namespaceValueSuggestions],
          },
          assertion: (suggestions) => {
            expectNamespaceValuesSuggestions(suggestions, [
              "sap.ui.core.dnd",
              "sap.ui.core.mvc",
              "sap.ui.core.search",
              "sap.ui.core.tmpl",
              "sap.ui.core.util",
            ]);
          },
        });
      });

      it("will suggest namespace values when value starts with prefix matching several namespaces", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns:abc="sap.ui.u⇶">
          </mvc:View>`;

        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [namespaceValueSuggestions],
          },
          assertion: (suggestions) => {
            expectNamespaceValuesSuggestions(suggestions, [
              "sap.ui.unified",
              "sap.ui.unified.calendar",
              "sap.ui.ux3",
            ]);
          },
        });
      });

      it("will suggest namespace values that contain the prefix when exploration mode doesn't return any namespaces", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="ui.core.⇶">
          </mvc:View>`;

        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [namespaceValueSuggestions],
          },
          assertion: (suggestions) => {
            expectNamespaceValuesSuggestions(suggestions, [
              "sap.ui.core.dnd",
              "sap.ui.core.mvc",
              "sap.ui.core.search",
              "sap.ui.core.tmpl",
              "sap.ui.core.util",
            ]);
          },
        });
      });

      it("will suggest namespaces when used on non-class element", () => {
        const xmlSnippet = `
        <mvc:Controller1
          xmlns:mvc="sap.ui.core⇶">
        </mvc:Controller1>`;

        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeValue: [namespaceValueSuggestions],
          },
          assertion: (suggestions) => {
            expectNamespaceValuesSuggestions(suggestions, ["sap.ui.core.mvc"]);
          },
        });
      });
    });

    describe("not reproducible scenarios", () => {
      it("will not suggest when attribute key is null", () => {
        const xmlAttribute = createXMLAttribute("dummy", null, null, {});
        const suggestions = namespaceValueSuggestions({
          attribute: xmlAttribute,
          context: appContext,
          element: xmlAttribute.parent,
          prefix: "",
        });
        expect(suggestions).toBeEmpty();
      });
    });
  });
});

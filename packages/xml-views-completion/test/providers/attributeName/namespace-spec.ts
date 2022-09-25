import { expect } from "chai";
import { difference, partial } from "lodash";
import {
  AppContext,
  UI5Aggregation,
  UI5Association,
  UI5Class,
  UI5EnumValue,
  UI5Event,
  UI5Namespace,
  UI5Prop,
  UI5SemanticModel,
} from "@ui5-language-assistant/semantic-model-types";
import { generate } from "@ui5-language-assistant/semantic-model";
import { ui5NodeToFQN } from "@ui5-language-assistant/logic-utils";
import {
  expectSuggestions,
  expectXMLAttribute,
  generateModel,
} from "@ui5-language-assistant/test-utils";
import {
  isExistingNamespaceAttribute,
  namespaceKeysSuggestions,
} from "../../../src/providers/attributeName/namespace";
import { UI5NamespacesInXMLAttributeKeyCompletion } from "../../../api";
import { createXMLAttribute, testSuggestionsScenario } from "../../utils";

const allExpectedNamespaces = [
  "sap.f",
  "sap.f.cards",
  "sap.f.dnd",
  "sap.f.semantic",
  "sap.m",
  "sap.m.semantic",
  "sap.m.upload",
  "sap.tnt",
  "sap.ui.codeeditor",
  "sap.ui.commons",
  "sap.ui.commons.form",
  "sap.ui.commons.layout",
  "sap.ui.core",
  "sap.ui.core.dnd",
  "sap.ui.core.search",
  "sap.ui.core.tmpl",
  "sap.ui.core.util",
  "sap.ui.demokit",
  "sap.ui.fl.variants",
  "sap.ui.fl.transport",
  "sap.ui.layout",
  "sap.ui.layout.cssgrid",
  "sap.ui.layout.form",
  "sap.ui.core.mvc",
  "sap.ui.suite",
  "sap.ui.table",
  "sap.ui.table.plugins",
  "sap.ui.table.rowmodes",
  "sap.ui.unified",
  "sap.ui.unified.calendar",
  "sap.ui.ux3",
  "sap.uxap",
  // Dist layer
  "sap.ca.ui",
  "sap.ca.ui.charts",
  "sap.chart",
  "sap.chart.data",
  "sap.gantt",
  "sap.gantt.axistime",
  "sap.gantt.config",
  "sap.gantt.control",
  "sap.gantt.def",
  "sap.gantt.def.cal",
  "sap.gantt.def.filter",
  "sap.gantt.def.gradient",
  "sap.gantt.def.pattern",
  "sap.gantt.shape",
  "sap.gantt.shape.cal",
  "sap.gantt.shape.ext",
  "sap.gantt.shape.ext.rls",
  "sap.gantt.shape.ext.ubc",
  "sap.gantt.shape.ext.ulc",
  "sap.gantt.simple",
  "sap.gantt.simple.shapes",
  "sap.landvisz",
  "sap.landvisz.internal",
  "sap.makit",
  "sap.me",
  "sap.ndc",
  "sap.rules.ui",
  "sap.rules.ui.services",
  "sap.suite.ui.commons",
  "sap.suite.ui.commons.imageeditor",
  "sap.suite.ui.commons.networkgraph",
  "sap.suite.ui.commons.networkgraph.layout",
  "sap.suite.ui.commons.statusindicator",
  "sap.suite.ui.commons.taccount",
  "sap.suite.ui.microchart",
  "sap.ui.comp.filterbar",
  "sap.ui.comp.navpopover",
  "sap.ui.comp.smartchart",
  "sap.ui.comp.smartfield",
  "sap.ui.comp.smartfilterbar",
  "sap.ui.comp.smartform",
  "sap.ui.comp.smartlist",
  "sap.ui.comp.smartmicrochart",
  "sap.ui.comp.smartmultiedit",
  "sap.ui.comp.smartmultiinput",
  "sap.ui.comp.smarttable",
  "sap.ui.comp.smartvariants",
  "sap.ui.comp.transport",
  "sap.ui.comp.valuehelpdialog",
  "sap.ui.comp.variants",
  "sap.ui.integration.widgets",
  "sap.ui.richtexteditor",
  "sap.ui.vbm",
  "sap.ui.vk",
  "sap.ui.vk.dvl",
  "sap.ui.vk.threejs",
  "sap.ui.vk.tools",
  "sap.ui.vtm",
  "sap.ui.vtm.extensions",
  "sap.uiext.inbox",
  "sap.uiext.inbox.composite",
  "sap.ushell.components.factsheet.controls",
  "sap.ushell.ui.appfinder",
  "sap.ushell.ui.footerbar",
  "sap.ushell.ui.launchpad",
  "sap.ushell.ui.shell",
  "sap.viz.ui5",
  "sap.viz.ui5.controls",
  "sap.viz.ui5.controls.common",
  "sap.viz.ui5.controls.common.feeds",
  "sap.viz.ui5.core",
  "sap.viz.ui5.data",
  "sap.viz.ui5.types",
  "sap.viz.ui5.types.controller",
  "sap.viz.ui5.types.layout",
  "sap.viz.ui5.types.legend",
];

const expectNamespaceKeysSuggestions = partial(expectSuggestions, (_) => {
  expect(_.type).to.equal("UI5NamespacesInXMLAttributeKey");
  const namespaceInKey = _ as UI5NamespacesInXMLAttributeKeyCompletion;
  expectUI5Namespace(namespaceInKey.ui5Node);
  expectXMLAttribute(namespaceInKey.astNode);
  return ui5NodeToFQN(namespaceInKey.ui5Node);
});

describe("The ui5-language-assistant xml-views-completion", () => {
  let ui5SemanticModel: UI5SemanticModel;
  let appContext: AppContext;

  before(async () => {
    ui5SemanticModel = await generateModel({
      framework: "SAPUI5",
      version: "1.71.49",
      modelGenerator: generate,
    });
    appContext = {
      services: {},
      ui5Model: ui5SemanticModel,
    };
  });

  context("namespaces", () => {
    context("applicable scenarios", () => {
      it("will suggest when 'xmlns' prefix provided", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns⇶
          xmlns:mvc="sap.ui.core.mvc">
        </mvc:View>`;
        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeName: [namespaceKeysSuggestions],
          },
          assertion: (suggestions) => {
            expectNamespaceKeysSuggestions(
              suggestions,
              difference(allExpectedNamespaces, ["sap.ui.core.mvc"])
            );
          },
        });
      });

      it("will suggest when 'xmlns:' prefix provided", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns:⇶
          xmlns="sap.m" enable="true">
        </mvc:View>`;
        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeName: [namespaceKeysSuggestions],
          },
          assertion: (suggestions) => {
            expectNamespaceKeysSuggestions(
              suggestions,
              difference(allExpectedNamespaces, ["sap.m", "sap.ui.core.mvc"])
            );
          },
        });
      });

      it("will suggest when 'xmlns:u' prefix provided", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns:u⇶
          xmlns="sap.m" 
          xmlns:suite="">
        </mvc:View>`;
        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeName: [namespaceKeysSuggestions],
          },
          assertion: (suggestions) => {
            expectNamespaceKeysSuggestions(suggestions, [
              "sap.m.upload",
              "sap.ui.core.util",
              "sap.ui.ux3",
              "sap.uxap",
              "sap.ui.unified",
              "sap.ca.ui",
              "sap.gantt.shape.ext.ubc",
              "sap.gantt.shape.ext.ulc",
              "sap.rules.ui",
              "sap.viz.ui5",
            ]);
          },
        });
      });
    });

    describe("the prefix namespace completions utilities", () => {
      it("will not suggest when used on not applicable attribute key prefix ('xm')", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xm⇶
          xmlns:m>
        </mvc:View>`;
        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeName: [namespaceKeysSuggestions],
          },
          assertion: (suggestions) => {
            expect(suggestions).to.be.empty;
          },
        });
      });

      it("will not suggest when used on undefined attribute key prefix", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          ⇶
          xmlns="sap.m">
        </mvc:View>`;
        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeName: [namespaceKeysSuggestions],
          },
          assertion: (suggestions) => {
            expect(suggestions).to.be.empty;
          },
        });
      });

      it("will suggest when used on non-class element", () => {
        const xmlSnippet = `
        <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
            <Page1 xmlns:⇶>

            </Page1>
          </mvc:View>`;
        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            attributeName: [namespaceKeysSuggestions],
          },
          assertion: (suggestions) => {
            expectNamespaceKeysSuggestions(suggestions, allExpectedNamespaces);
          },
        });
      });
    });

    context("not reproducible scenario", () => {
      //TODO check with Shachar if this case can be received from xml
      context("isExistingNamespaceAttribute", () => {
        it("invalid attribute key", () => {
          const attributeWithInvalidKey = createXMLAttribute(
            "dummy",
            null,
            null,
            {}
          );
          expect(isExistingNamespaceAttribute(attributeWithInvalidKey)).to.be
            .false;
        });
      });
    });
  });
});

export function expectUI5Namespace(
  ui5Node:
    | UI5Class
    | UI5Aggregation
    | UI5Association
    | UI5Prop
    | UI5Event
    | UI5EnumValue
    | UI5Namespace
): asserts ui5Node is UI5Namespace {
  expect(ui5Node.kind).to.equal("UI5Namespace");
}

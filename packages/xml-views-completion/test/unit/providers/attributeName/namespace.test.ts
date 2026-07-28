import { difference, partial } from "lodash";
import {
  UI5Aggregation,
  UI5Association,
  UI5Class,
  UI5EnumValue,
  UI5Event,
  UI5Namespace,
  UI5Prop,
  UI5SemanticModel,
} from "@ui5-language-assistant/semantic-model-types";
import {
  DEFAULT_UI5_FRAMEWORK,
  DEFAULT_UI5_VERSION,
} from "@ui5-language-assistant/constant";
import { generate } from "@ui5-language-assistant/semantic-model";
import { ui5NodeToFQN } from "@ui5-language-assistant/logic-utils";
import {
  expectSuggestions,
  expectXMLAttribute,
  generateModel,
  getFallbackPatchVersions,
} from "@ui5-language-assistant/test-utils";
import {
  isExistingNamespaceAttribute,
  namespaceKeysSuggestions,
} from "../../../../src/providers/attributeName/namespace";
import { UI5NamespacesInXMLAttributeKeyCompletion } from "../../../../api";
import {
  createXMLAttribute,
  getDefaultContext,
  testSuggestionsScenario,
} from "../../utils";
import { Context as AppContext } from "@ui5-language-assistant/context";

const allExpectedNamespaces = [
  "sap.f",
  "sap.f.cards",
  "sap.f.dnd",
  "sap.f.semantic",
  "sap.m",
  "sap.m.p13n",
  "sap.m.plugins",
  "sap.m.semantic",
  "sap.m.table.columnmenu",
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
  "sap.ui.core.webc",
  "sap.ui.fl.variants",
  "sap.ui.fl.transport",
  "sap.ui.integration",
  "sap.ui.integration.designtime.baseEditor",
  "sap.ui.integration.designtime.baseEditor.propertyEditor",
  "sap.ui.integration.designtime.baseEditor.propertyEditor.arrayEditor",
  "sap.ui.integration.designtime.baseEditor.propertyEditor.booleanEditor",
  "sap.ui.integration.designtime.baseEditor.propertyEditor.codeEditor",
  "sap.ui.integration.designtime.baseEditor.propertyEditor.dateEditor",
  "sap.ui.integration.designtime.baseEditor.propertyEditor.dateTimeEditor",
  "sap.ui.integration.designtime.baseEditor.propertyEditor.enumStringEditor",
  "sap.ui.integration.designtime.baseEditor.propertyEditor.groupEditor",
  "sap.ui.integration.designtime.baseEditor.propertyEditor.iconEditor",
  "sap.ui.integration.designtime.baseEditor.propertyEditor.integerEditor",
  "sap.ui.integration.designtime.baseEditor.propertyEditor.jsonEditor",
  "sap.ui.integration.designtime.baseEditor.propertyEditor.listEditor",
  "sap.ui.integration.designtime.baseEditor.propertyEditor.mapEditor",
  "sap.ui.integration.designtime.baseEditor.propertyEditor.multiSelectEditor",
  "sap.ui.integration.designtime.baseEditor.propertyEditor.numberEditor",
  "sap.ui.integration.designtime.baseEditor.propertyEditor.objectArrayEditor",
  "sap.ui.integration.designtime.baseEditor.propertyEditor.selectEditor",
  "sap.ui.integration.designtime.baseEditor.propertyEditor.separatorEditor",
  "sap.ui.integration.designtime.baseEditor.propertyEditor.stringEditor",
  "sap.ui.integration.designtime.baseEditor.propertyEditor.textAreaEditor",
  "sap.ui.integration.designtime.cardEditor.propertyEditor.complexMapEditor",
  "sap.ui.integration.designtime.cardEditor.propertyEditor.destinationsEditor",
  "sap.ui.integration.designtime.cardEditor.propertyEditor.filtersEditor",
  "sap.ui.integration.designtime.cardEditor.propertyEditor.iconEditor",
  "sap.ui.integration.designtime.cardEditor.propertyEditor.parametersEditor",
  "sap.ui.integration.designtime.editor",
  "sap.ui.integration.editor",
  "sap.ui.integration.editor.fields",
  "sap.ui.integration.editor.fields.viz",
  "sap.ui.integration.util",
  "sap.ui.integration.widgets",
  "sap.ui.layout",
  "sap.ui.layout.cssgrid",
  "sap.ui.layout.form",
  "sap.ui.core.mvc",
  "sap.ui.mdc",
  "sap.ui.mdc.actiontoolbar",
  "sap.ui.mdc.chart",
  "sap.ui.mdc.condition",
  "sap.ui.mdc.field",
  "sap.ui.mdc.filterbar",
  "sap.ui.mdc.filterbar.p13n",
  "sap.ui.mdc.filterbar.vh",
  "sap.ui.mdc.link",
  "sap.ui.mdc.table",
  "sap.ui.mdc.util",
  "sap.ui.mdc.valuehelp",
  "sap.ui.mdc.valuehelp.base",
  "sap.ui.mdc.valuehelp.content",
  "sap.ui.suite",
  "sap.ui.table",
  "sap.ui.table.plugins",
  "sap.ui.table.rowmodes",
  "sap.ui.unified",
  "sap.ui.unified.calendar",
  "sap.ui.ux3",
  "sap.ui.vbm",
  "sap.ui.vk",
  "sap.ui.vk.dvl",
  "sap.ui.vk.svg",
  "sap.ui.vk.threejs",
  "sap.ui.vk.tools",
  "sap.ui.vtm",
  "sap.ui.vtm.extensions",
  "sap.ui.webc.common",
  "sap.ui.webc.fiori",
  "sap.ui.webc.main",
  "sap.uiext.inbox",
  "sap.uiext.inbox.composite",
  "sap.uxap",
  // Dist layer
  "sap.ca.ui",
  "sap.ca.ui.charts",
  "sap.chart",
  "sap.chart.data",
  "sap.esh.search.ui",
  "sap.fe.macros",
  "sap.gantt",
  "sap.gantt.axistime",
  "sap.gantt.config",
  "sap.gantt.control",
  "sap.gantt.def",
  "sap.gantt.def.cal",
  "sap.gantt.def.filter",
  "sap.gantt.def.gradient",
  "sap.gantt.def.pattern",
  "sap.gantt.legend",
  "sap.gantt.overlays",
  "sap.gantt.shape",
  "sap.gantt.shape.cal",
  "sap.gantt.shape.ext",
  "sap.gantt.shape.ext.rls",
  "sap.gantt.shape.ext.ubc",
  "sap.gantt.shape.ext.ulc",
  "sap.gantt.simple",
  "sap.gantt.simple.shapes",
  "sap.insights",
  "sap.makit",
  "sap.me",
  "sap.ndc",
  "sap.rules.ui",
  "sap.rules.ui.services",
  "sap.sac.df",
  "sap.sac.df.changeHandler",
  "sap.suite.ui.commons",
  "sap.suite.ui.commons.imageeditor",
  "sap.suite.ui.commons.networkgraph",
  "sap.suite.ui.commons.networkgraph.layout",
  "sap.suite.ui.commons.statusindicator",
  "sap.suite.ui.commons.taccount",
  "sap.suite.ui.microchart",
  "sap.ui.comp.filterbar",
  "sap.ui.comp.navpopover",
  "sap.ui.comp.odata",
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
  "sap.ui.comp.valuehelpdialog",
  "sap.ui.comp.variants",
  "sap.ui.richtexteditor",
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
  "sap.zen.commons.layout",
  "sap.zen.crosstab",
  "sap.zen.dsh",
];

const expectNamespaceKeysSuggestions = partial(
  expectSuggestions,
  (_: unknown) => {
    const item = _ as { type: string };
    expect(item.type).toEqual("UI5NamespacesInXMLAttributeKey");
    const namespaceInKey = _ as UI5NamespacesInXMLAttributeKeyCompletion;
    expectUI5Namespace(namespaceInKey.ui5Node);
    expectXMLAttribute(namespaceInKey.astNode);
    return ui5NodeToFQN(namespaceInKey.ui5Node);
  }
);

describe("The ui5-language-assistant xml-views-completion", () => {
  let ui5SemanticModel: UI5SemanticModel;
  let appContext: AppContext;
  beforeAll(async () => {
    ui5SemanticModel = await generateModel({
      framework: DEFAULT_UI5_FRAMEWORK,
      version: (
        await getFallbackPatchVersions()
      ).SAPUI5 as typeof DEFAULT_UI5_VERSION,
      modelGenerator: generate,
    });
    appContext = getDefaultContext(ui5SemanticModel);
  });

  describe("namespaces", () => {
    describe("applicable scenarios", () => {
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
              "sap.ui.integration.util",
              "sap.ui.mdc.util",
              "sap.ui.ux3",
              "sap.uxap",
              "sap.ui.unified",
              "sap.ca.ui",
              "sap.esh.search.ui",
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
            expect(suggestions).toBeEmpty();
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
            expect(suggestions).toBeEmpty();
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

    describe("not reproducible scenario", () => {
      //TODO check with Shachar if this case can be received from xml
      describe("isExistingNamespaceAttribute", () => {
        it("invalid attribute key", () => {
          const attributeWithInvalidKey = createXMLAttribute(
            "dummy",
            null,
            null,
            {}
          );
          expect(
            isExistingNamespaceAttribute(attributeWithInvalidKey)
          ).toBeFalse();
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
  expect(ui5Node.kind).toEqual("UI5Namespace");
}

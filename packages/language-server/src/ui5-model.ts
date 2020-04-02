import { map } from "lodash";
import fetch from "node-fetch";

import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  generate,
  Json,
  TypeNameFix
} from "@ui5-language-assistant/semantic-model";
import { Fetcher } from "api";

// TODO: use 1.71.x
const DEFAULT_UI5_VERSION = "1.71.14";

let fetcher: Fetcher = fetch;

// These functions are for testing purposes
/* istanbul ignore next */
export function getFetch(): Fetcher {
  return fetcher;
}
/* istanbul ignore next */
export function setFetch(fetch: Fetcher): void {
  fetcher = fetch;
}

export async function getSemanticModel(): Promise<UI5SemanticModel> {
  const version = DEFAULT_UI5_VERSION;
  const jsonMap: Record<string, Json> = {};
  const baseUrl = `https://sapui5.hana.ondemand.com/${version}/test-resources/`;
  const suffix = "/designtime/api.json";
  const libs = getLibs();

  await Promise.all(
    map(libs, async libName => {
      const url = baseUrl + libName + suffix;
      const response = await fetcher(url);
      if (response.ok) {
        const apiJson = await response.json();
        jsonMap[libName] = apiJson;
      } else {
        console.error(`could not read from ${url}`);
      }
    })
  );

  return generate({
    version: version,
    libraries: jsonMap,
    typeNameFix: getTypeNameFix(),
    strict: false
  });
}

function getTypeNameFix(): TypeNameFix {
  const fixes: TypeNameFix = {
    Control: "sap.ui.core.Control",
    Element: "sap.ui.core.Element",
    array: "object[]",
    Array: "object[]",
    bloolean: "boolean",
    "sap.m.PlanningCalendarHeader": undefined,
    "sap.m.TimePickerSlider": undefined,
    "sap.ui.layout.ResponsiveSplitterPage": undefined,
    "sap.gantt.misc.AxisTime": "sap.gantt.misc.AxisTimes",
    "sap.gantt.control.Toolbar": undefined,
    "sap.gantt.DragOrientation": undefined,
    "sap.gantt.simple.GanttHeader": undefined,
    "sap.gantt.simple.InnerGanttChart": undefined,
    "sap.rules.ui.RuleBase": undefined,
    "sap.ui.generic.app.transaction.BaseController": undefined,
    "sap.ui.vk.BillboardTextEncoding": undefined,
    "sap.ui.vk.BillboardStyle": undefined,
    "sap.ui.vk.BillboardBorderLineStyle": undefined,
    "sap.ui.vk.BillboardHorizontalAlignment": undefined,
    "sap.ui.vk.BillboardCoordinateSpace": undefined,
    "sap.ui.vk.DetailViewType": undefined,
    "sap.ui.vk.DetailViewShape": undefined,
    "sap.ui.vk.tools.HitTestIdMode": undefined,
    "sap.ui.vk.tools.CoordinateSystem": undefined,
    "sap.ui.vk.AnimationTimeSlider": undefined,
    "sap.ui.vk.SelectionMode": undefined,
    "sap.ui.vk.RenderMode": undefined,
    "sap.viz.ui5.controls.VizRangeSlider": undefined
  };
  return fixes;
}

function getLibs(): string[] {
  // When we support more version the following libraries should be added:
  // "sap.fileviewer"
  return map(
    [
      "sap.ui.core",
      "sap.apf",
      "sap.ca.scfld.md",
      "sap.ca.ui",
      "sap.chart",
      "sap.collaboration",
      "sap.f",
      "sap.fe",
      "sap.gantt",
      "sap.landvisz",
      "sap.m",
      "sap.makit",
      "sap.me",
      "sap.ndc",
      "sap.ovp",
      "sap.rules.ui",
      "sap.suite.ui.commons",
      "sap.suite.ui.generic.template",
      "sap.suite.ui.microchart",
      "sap.tnt",
      "sap.ui.codeeditor",
      "sap.ui.commons",
      "sap.ui.comp",
      "sap.ui.dt",
      "sap.ui.export",
      "sap.ui.fl",
      "sap.ui.generic.app",
      "sap.ui.generic.template",
      "sap.ui.integration",
      "sap.ui.layout",
      "sap.ui.mdc",
      "sap.ui.richtexteditor",
      "sap.ui.rta",
      "sap.ui.suite",
      "sap.ui.support",
      "sap.ui.table",
      "sap.ui.testrecorder",
      "sap.ui.unified",
      "sap.ui.ux3",
      "sap.ui.vbm",
      "sap.ui.vk",
      "sap.ui.vtm",
      "sap.uiext.inbox",
      "sap.ushell",
      "sap.uxap",
      "sap.viz",
      "sap.zen.commons",
      "sap.zen.crosstab",
      "sap.zen.dsh"
    ],
    _ => _.replace(/\./g, "/")
  );
}

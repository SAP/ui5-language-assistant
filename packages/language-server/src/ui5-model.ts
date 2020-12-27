import { map } from "lodash";
import fetch from "node-fetch";
import { resolve } from "path";
import { pathExists, lstat, readJson, writeJson, mkdirs } from "fs-extra";

import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  generate,
  Json,
  TypeNameFix,
} from "@ui5-language-assistant/semantic-model";
import { Fetcher } from "../api";
import { getLogger } from "./logger";

const DEFAULT_UI5_VERSION = "1.71.14";

export async function getSemanticModel(
  modelCachePath: string | undefined
): Promise<UI5SemanticModel> {
  return getSemanticModelWithFetcher(fetch, modelCachePath);
}

// This function is exported for testing purposes (using a mock fetcher)
export async function getSemanticModelWithFetcher(
  fetcher: Fetcher,
  modelCachePath: string | undefined
): Promise<UI5SemanticModel> {
  const version = DEFAULT_UI5_VERSION;
  getLogger().info("building UI5 semantic Model for version", { version });
  const jsonMap: Record<string, Json> = {};
  const baseUrl = `https://sapui5.hana.ondemand.com/${version}/test-resources/`;
  const suffix = "/designtime/api.json";
  const libs = getLibs();
  let cacheFolder: string | undefined;

  // Note: all cache handling (reading, writing etc) is optional from the user perspective but
  // impacts performance, therefore if any errors occur when handling the cache we ignore them but output
  // a warning to the user
  if (modelCachePath !== undefined) {
    cacheFolder = getCacheFolder(modelCachePath, version);
    getLogger().info("Caching UI5 resources in", { cacheFolder });
    try {
      await mkdirs(cacheFolder);
    } catch (err) {
      getLogger().warn("Failed creating UI5 resources cache folder`", {
        cacheFolder,
        msg: err,
      });
      cacheFolder = undefined;
    }
  }

  await Promise.all(
    map(libs, async (libName) => {
      const cacheFilePath = getCacheFilePath(cacheFolder, libName);
      let apiJson = await readFromCache(cacheFilePath);
      // If the file doesn't exist in the cache (or we couldn't read it), fetch it from the network
      if (apiJson === undefined) {
        getLogger().info("No cache found for UI5 lib", { libName });
        const url = baseUrl + libName.replace(/\./g, "/") + suffix;
        const response = await fetcher(url);
        if (response.ok) {
          apiJson = await response.json();
          await writeToCache(cacheFilePath, apiJson);
        } else {
          getLogger().error("Could not read UI5 resources from", { url });
        }
      } else {
        getLogger().info("Reading Cache For UI5 Lib ", {
          libName,
          cacheFilePath,
        });
      }
      if (apiJson !== undefined) {
        jsonMap[libName] = apiJson;
      }
    })
  );

  return generate({
    version: version,
    libraries: jsonMap,
    typeNameFix: getTypeNameFix(),
    strict: false,
    printValidationErrors: false,
  });
}

async function readFromCache(filePath: string | undefined): Promise<unknown> {
  if (filePath !== undefined) {
    try {
      if ((await pathExists(filePath)) && (await lstat(filePath)).isFile()) {
        return await readJson(filePath);
      }
    } catch (err) {
      getLogger().warn("Could not read cache file For UI5 lib", {
        filePath,
        error: err,
      });
    }
  }
  return undefined;
}

async function writeToCache(
  filePath: string | undefined,
  apiJson: unknown
): Promise<void> {
  if (filePath !== undefined) {
    try {
      await writeJson(filePath, apiJson);
    } catch (err) {
      getLogger().warn("Could not read cache file For UI5 lib", {
        filePath,
        error: err,
      });
    }
  }
}

// Exported for test purposes
export function getCacheFolder(
  modelCachePath: string,
  version: string
): string {
  return resolve(modelCachePath, "ui5-resources-cache", version);
}
// Exported for test purposes
export function getCacheFilePath(
  cacheFolder: string | undefined,
  libName: string
): string | undefined {
  if (cacheFolder === undefined) {
    return undefined;
  }
  return resolve(cacheFolder, libName + ".json");
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
    "sap.viz.ui5.controls.VizRangeSlider": undefined,
  };
  return fixes;
}

function getLibs(): string[] {
  // When we support more version the following libraries should be added:
  // "sap.fileviewer"
  // "sap.ui.testrecorder"
  // "sap.zen.dsh"
  // "sap.zen.crosstab"
  return [
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
  ];
}

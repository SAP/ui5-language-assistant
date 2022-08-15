import { map } from "lodash";
import fetch from "node-fetch";
import { resolve } from "path";
import {
  readFile,
  pathExists,
  lstat,
  readJson,
  writeJson,
  mkdirs,
} from "fs-extra";

import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  generate,
  Json,
  TypeNameFix,
} from "@ui5-language-assistant/semantic-model";
import { Fetcher } from "../api";
import { getLogger } from "./logger";
import globby from "globby";
import { parse } from "yaml";

const DEFAULT_UI5_FRAMEWORK = "sapui5";
const DEFAULT_UI5_VERSION = "1.71.49";

const UI5_FRAMEWORK_CDN_BASE_URL = {
  openui5: "https://sdk.openui5.org/",
  sapui5: "https://ui5.sap.com/",
};

export async function getSemanticModel(
  modelCachePath: string | undefined,
  workspacePath: string | undefined
): Promise<UI5SemanticModel> {
  return getSemanticModelWithFetcher(fetch, modelCachePath, workspacePath);
}

// This function is exported for testing purposes (using a mock fetcher)
export async function getSemanticModelWithFetcher(
  fetcher: Fetcher,
  modelCachePath: string | undefined,
  workspacePath: string | undefined
): Promise<UI5SemanticModel> {
  // determine the ui5 version from the project configuration:
  //   1.) ui5.yaml in project root
  //   2.) package.json in project root
  //   3.) use default framework/version
  let framework, version;
  if (workspacePath) {
    // by default the framework/version are determined from the ui5.yaml:
    //
    // framework:
    //   name: SAPUI5
    //   version: "1.71.49"
    const ui5YamlPath = (await globby([`${workspacePath}/ui5.yaml`]))?.pop();
    if (ui5YamlPath) {
      getLogger().info("Reading framework/version from ui5.yaml ", {
        ui5YamlPath,
      });
      const ui5YamlContent = await readFile(ui5YamlPath, { encoding: "utf8" });
      const ui5Yaml = parse(ui5YamlContent);
      framework = ui5Yaml?.framework?.name?.toLowerCase();
      version = ui5Yaml?.framework?.version;
    }
    // if the framework/version cannot be read from the ui5.yaml fallback to package.json
    // to read the framework/version from the package.json>ui5>framework section:
    //
    // {
    //   "ui5": {
    //     "framework": {
    //       "name": "SAPUI5",
    //       "version": "1.71.49"
    //     }
    //   }
    // }
    if (!framework || !version) {
      const packageJsonPath = (
        await globby([`${workspacePath}/package.json`])
      )?.pop();
      if (packageJsonPath) {
        getLogger().info("Reading framwork/version from package.json ", {
          packageJsonPath,
        });
        const packageJsonContent = await readFile(packageJsonPath, {
          encoding: "utf8",
        });
        const packageJson = JSON.parse(packageJsonContent);
        framework = packageJson?.ui5?.framework?.name?.toLowerCase();
        version = packageJson?.ui5?.framework?.version;
      }
    }
  }

  // no framework/version determined? use defaults!
  if (!framework) {
    framework = DEFAULT_UI5_FRAMEWORK;
    getLogger().warn(
      "No framework configuration found, using default framework! "
    );
  }
  if (!version) {
    version = DEFAULT_UI5_VERSION;
    getLogger().warn("No version configuration found, using default version! ");
  }

  // Log the detected framework name/version
  getLogger().info("The following framework/version has been detected ", {
    framework,
    version,
  });

  // Note: all cache handling (reading, writing etc) is optional from the user perspective but
  // impacts performance, therefore if any errors occur when handling the cache we ignore them but output
  // a warning to the user
  let cacheFolder: string | undefined;
  if (modelCachePath !== undefined) {
    cacheFolder = getCacheFolder(modelCachePath, framework, version);
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

  getLogger().info("building UI5 semantic Model for framework/version", {
    framework,
    version,
  });

  const jsonMap: Record<string, Json> = {};
  const cdnBaseUrl = `${UI5_FRAMEWORK_CDN_BASE_URL[framework]}${version}/`;
  const baseUrl = `${cdnBaseUrl}test-resources/`;
  const suffix = "/designtime/api.json";

  const libs = await getLibsAsync(
    getCacheFilePath(cacheFolder, "_libs"),
    cdnBaseUrl
  );

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
        } else if (response.status === 404) {
          getLogger().error("Could not find UI5 lib from", { url });
          await writeToCache(cacheFilePath, {}); // write dummy file! TODO: how to invalidate?
        } else {
          getLogger().error("Could not read UI5 lib from", { url });
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
      getLogger().warn("Could not read cache file for", {
        filePath,
        error: err,
      });
    }
  }
  return undefined;
}

async function writeToCache(
  filePath: string | undefined,
  json: unknown
): Promise<void> {
  if (filePath !== undefined) {
    try {
      await writeJson(filePath, json);
    } catch (err) {
      getLogger().warn("Could not write cache file For UI5 lib", {
        filePath,
        error: err,
      });
    }
  }
}

// Exported for test purposes
export function getCacheFolder(
  modelCachePath: string,
  framework: string,
  version: string
): string {
  return resolve(modelCachePath, "ui5-resources-cache", framework, version);
}
// Exported for test purposes
export function getCacheFilePath(
  cacheFolder: string | undefined,
  fileName: string
): string | undefined {
  if (cacheFolder === undefined) {
    return undefined;
  }
  return resolve(cacheFolder, fileName + ".json");
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

async function getLibsAsync(
  cacheFilePath: string | undefined,
  cdnBaseUrl: string
): Promise<string[]> {
  let libs = (await readFromCache(cacheFilePath)) as string[];
  if (libs === undefined) {
    const url = `${cdnBaseUrl}resources/sap-ui-version.json`;
    const response = await fetch(url);
    if (response.ok) {
      const versionInfo = await response.json();
      // read libraries from version information
      libs = versionInfo?.libraries?.map((lib) => {
        return lib.name;
      }) as string[];
      writeToCache(cacheFilePath, libs);
    } else {
      getLogger().error("Could not read UI5 libraries from", { url });
    }
  }
  return libs;
}

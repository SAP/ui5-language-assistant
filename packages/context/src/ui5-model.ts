import { map, get } from "lodash";
import { resolve } from "path";
import { pathExists, lstat, readJson, writeJson, mkdirs } from "fs-extra";
import semver from "semver";
import semverMinSatisfying from "semver/ranges/min-satisfying";
import {
  UI5Framework,
  UI5SemanticModel,
} from "@ui5-language-assistant/semantic-model-types";
import {
  generate,
  Json,
  TypeNameFix,
} from "@ui5-language-assistant/semantic-model";
import { Fetcher } from "./types";
import { fetch } from "@ui5-language-assistant/logic-utils";
import {
  getLibraryAPIJsonUrl,
  getLogger,
  getVersionInfoUrl,
  getVersionJsonUrl,
} from "./utils";
import { DEFAULT_UI5_VERSION } from "./types";
import { cache } from "./cache";

export async function getSemanticModel(
  modelCachePath: string | undefined,
  framework: UI5Framework,
  version: string | undefined,
  ignoreCache?: boolean
): Promise<UI5SemanticModel> {
  return getSemanticModelWithFetcher(
    fetch,
    modelCachePath,
    framework,
    version,
    ignoreCache
  );
}

const isUI5Model = (
  model: UI5SemanticModel | undefined
): model is UI5SemanticModel => {
  return !!model;
};
// This function is exported for testing purposes (using a mock fetcher)
export async function getSemanticModelWithFetcher(
  fetcher: Fetcher,
  modelCachePath: string | undefined,
  framework: UI5Framework,
  version: string | undefined,
  ignoreCache?: boolean
): Promise<UI5SemanticModel> {
  const cacheKey = `${framework || "INVALID"}:${version || "INVALID"}`;
  const cachedUi5Model = cache.getUI5Model(cacheKey);
  if (!ignoreCache && isUI5Model(cachedUi5Model)) {
    return cachedUi5Model;
  }

  const data = await createSemanticModelWithFetcher(
    fetcher,
    modelCachePath,
    framework,
    version
  );
  cache.setUI5Model(cacheKey, data);
  return data;
}

// This function is exported for testing purposes (using a mock fetcher)
async function createSemanticModelWithFetcher(
  fetcher: Fetcher,
  modelCachePath: string | undefined,
  framework: UI5Framework,
  version: string | undefined
): Promise<UI5SemanticModel> {
  // negotiate the closest available version for the given framework
  const versionInfo = await negotiateVersion(
    modelCachePath,
    framework,
    version
  );
  version = versionInfo.version;
  const isFallback = versionInfo.isFallback;
  const isIncorrectVersion = versionInfo.isIncorrectVersion;

  // Log the detected framework name/version
  getLogger().info("The following framework/version has been detected", {
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

  const libs = await getLibs(modelCachePath, framework, version);

  await Promise.all(
    map(libs, async (libName) => {
      const cacheFilePath = getCacheFilePath(cacheFolder, libName);
      let apiJson = await readFromCache(cacheFilePath);
      // If the file doesn't exist in the cache (or we couldn't read it), fetch it from the network
      if (apiJson === undefined) {
        getLogger().info("No cache found for UI5 lib", { libName });
        const url = await getLibraryAPIJsonUrl(
          framework,
          version as string,
          libName
        );
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
        getLogger().info("Reading Cache For UI5 Lib", {
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
    version,
    libraries: jsonMap,
    typeNameFix: getTypeNameFix(),
    strict: false,
    printValidationErrors: false,
    isFallback,
    isIncorrectVersion,
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

async function getVersionInfo(
  fetcher: Fetcher,
  modelCachePath: string | undefined,
  framework: UI5Framework,
  version: string
): Promise<Json | undefined> {
  let cacheFilePath;
  if (modelCachePath !== undefined) {
    const cacheFolder = getCacheFolder(modelCachePath, framework, version);
    cacheFilePath = getCacheFilePath(cacheFolder, "sap-ui-version.json");
  }
  let versionInfo = await readFromCache(cacheFilePath);
  if (versionInfo === undefined) {
    const url = await getVersionInfoUrl(framework, version);
    const response = await fetcher(url);
    if (response.ok) {
      versionInfo = await response.json();
      writeToCache(cacheFilePath, versionInfo);
    } else {
      getLogger().error("Could not read version information", {
        url,
      });
    }
  }
  return versionInfo;
}

async function getLibs(
  modelCachePath: string | undefined,
  framework: UI5Framework,
  version: string
): Promise<string[] | undefined> {
  let libs: string[] | undefined = undefined;
  const versionInfo = await getVersionInfo(
    fetch,
    modelCachePath,
    framework,
    version
  );
  if (versionInfo !== undefined) {
    // read libraries from version information
    libs = map(get(versionInfo, "libraries"), (lib) => {
      return lib.name;
    }) as string[];
  }
  return libs;
}

// if library is not found, resolve next minor highest patch
const versionMap: Record<
  UI5Framework,
  Record<string, { version: string; support: string; lts: boolean }>
> = Object.create(null); // just an in-memory cache!
const resolvedVersions: Record<
  UI5Framework,
  Record<string, string>
> = Object.create(null);
/*
 * VERSION RESOLUTION LOGIC:
 * =========================
 *
 * The version is provided from the minUI5Version of the closest manifest.json. The version can be one of the following variants:
 *
 *   1.) "1.105.0"   : major.minor.patch version => use concrete version, fallback to min-satisfying version
 *   2.) "1.96"      : major.minor version       => prefer min-satisfying version (^1.96)
 *   3.) "${latest}" : version placeholder       => prefer latest
 *   4.) "a.b.c"     : invalid version           => prefer latest
 *   5.) undefined   : n/a version               => use default version
 *
 * The min-satisfying version will be derived from the version mapping information: https://ui5.sap.com/version.json. From the
 * version mapping information a list of the current supported major.minor.patch version will be derived which will be used to
 * derive the next closest version.
 *
 * The latest version will also be derived from the version mapping information by lookup the "latest" entry and extract the
 * major.minor.patch version.
 *
 * In any case, if a version cannot be resolved, the fallback will be the DEFAULT_UI5_VERSION (see above).
 *
 * /!\ If the version mapping information cannot be loaded, the DEFAULT_UI5_VERSION will be used as "latest" version.
 *
 */
async function negotiateVersion(
  modelCachePath: string | undefined,
  framework: UI5Framework,
  version: string | undefined
): Promise<{
  version: string;
  isFallback: boolean;
  isIncorrectVersion: boolean;
}> {
  return negotiateVersionWithFetcher(
    fetch,
    fetch,
    modelCachePath,
    framework,
    version
  );
}
// This function is exported for testing purposes (using a mock fetcher)
export async function negotiateVersionWithFetcher(
  versionJsonFetcher: Fetcher,
  versionInfoJsonFetcher: Fetcher,
  modelCachePath: string | undefined,
  framework: UI5Framework,
  version: string | undefined
): Promise<{
  version: string;
  isFallback: boolean;
  isIncorrectVersion: boolean;
}> {
  // try to negotiate version
  let isFallback = false;
  let isIncorrectVersion = false;
  let versions = versionMap[framework];
  if (!version) {
    // no version defined, using default version
    getLogger().warn(
      "No version defined! Please check the minUI5Version in your manifest.json!"
    );
    version = DEFAULT_UI5_VERSION;
    isFallback = true;
  } else if (resolvedVersions[framework]?.[version]) {
    // version already resolved?
    const versionDefined = version;
    version = resolvedVersions[framework]?.[version];
    if (versionDefined !== version) {
      isIncorrectVersion = true;
    }
  } else if (
    !(await getVersionInfo(
      versionInfoJsonFetcher,
      modelCachePath,
      framework,
      version
    ))
  ) {
    const requestedVersion = version;
    // no version information found, try to negotiate the version
    if (!versions) {
      // retrieve the version mapping (only exists for SAPUI5 so far)
      const url = getVersionJsonUrl(framework);
      const response = await versionJsonFetcher(url);
      if (response.ok) {
        versionMap[framework] = (await response.json()) as Record<
          string,
          { version: string; support: string; lts: boolean }
        >;
      } else {
        isFallback = true;
        getLogger().error(
          "Could not read version mapping, fallback to default version",
          {
            url,
            DEFAULT_UI5_VERSION,
          }
        );
        versionMap[framework] = {
          latest: {
            version: DEFAULT_UI5_VERSION,
            support: "Maintenance",
            lts: true,
          },
        };
      }
      versions = versionMap[framework];
    }
    // coerce the version (check for invalid version, which indicates development scenario)
    const parsedVersion = semver.coerce(version);
    if (parsedVersion) {
      if (versions[`${parsedVersion.major}.${parsedVersion.minor}`]) {
        // lookup for a valid major.minor entry
        version =
          versions[`${parsedVersion.major}.${parsedVersion.minor}`].version;
      }
      if (
        !(await getVersionInfo(
          versionInfoJsonFetcher,
          modelCachePath,
          framework,
          version
        ))
      ) {
        // find closest supported version
        version =
          semverMinSatisfying(
            Object.values(versions).map((entry) => {
              return entry.version;
            }) as string[],
            `^${version}`
          ) || versions["latest"].version;

        isIncorrectVersion = true;
      }
    } else {
      // development scenario => use latest version
      version = versions["latest"].version;
      isIncorrectVersion = true;
    }
    // store the resolved version
    if (requestedVersion) {
      if (requestedVersion !== version) {
        isIncorrectVersion = true;
      }
      if (!resolvedVersions[framework]) {
        resolvedVersions[framework] = Object.create(null);
      }
      resolvedVersions[framework][requestedVersion] = version;
    }
  }
  return {
    version: version ?? DEFAULT_UI5_VERSION,
    isFallback,
    isIncorrectVersion,
  };
}

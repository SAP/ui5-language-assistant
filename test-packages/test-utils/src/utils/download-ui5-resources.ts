import { zipObject, map, noop, get } from "lodash";
import { resolve } from "path";
import { writeFile, mkdirs, pathExists } from "fs-extra";
import { UI5Framework } from "@ui5-language-assistant/semantic-model-types";
import {
  UI5_FRAMEWORK_CDN_BASE_URL,
  DEFAULT_OPEN_UI5_VERSION,
  DEFAULT_UI5_VERSION,
  DEFAULT_UI5_VERSION_BASE,
  DEFAULT_UI5_FRAMEWORK,
  OPEN_FRAMEWORK,
} from "@ui5-language-assistant/constant";

const importDynamic = (modulePath: string) => {
  try {
    return import(modulePath);
  } catch (e) {
    console.log(e);
  }
  return Promise.resolve("");
};

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const nodeFetch = async (...args: any[]) => {
  const module = await importDynamic("node-fetch");
  return module.default(...args);
};
import { RequestInfo, RequestInit, Response } from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";
import { getProxyForUrl } from "proxy-from-env";

import { TestModelVersion } from "../../api";

// Disable this flag if you want/need spam/info in the tests logs.
const silent = true;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const log = silent ? noop : (_: string) => console.log(_);
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const error = silent ? noop : (_: string) => console.error(_);

async function fetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
  // determine the proxy settings for the given url
  const proxy = getProxyForUrl(url) as string;
  // if a proxy has been found we override the agent of
  // the init opts to add the proxy agent
  if (proxy) {
    init = Object.assign({}, init, {
      agent: new HttpsProxyAgent(proxy),
    });
  }
  // call the node-fetch API
  return nodeFetch(url, init);
}

async function getLibs(version: TestModelVersion): Promise<string[]> {
  // The metadata.json seems to have been added only very recently :(
  // For now we assume the libraries are the same in all versions, when we support newer versions we should
  // do a better check here
  let versionInMetadataURL: string = version;
  if (versionInMetadataURL !== "1.71.60") {
    versionInMetadataURL = "1.71.60";
  }
  const url = `https://ui5.sap.com/${versionInMetadataURL}/resources/sap-ui-version.json`;
  const response = await fetch(url);
  if (!response.ok) {
    log(`error fetching from ${url}`);
    return [];
  }
  const versionInfo = await response.json();
  // read libraries from version information
  return map(get(versionInfo, "libraries"), (lib) => {
    return lib.name;
  }) as string[];
}

export async function addUi5Resources(
  version: TestModelVersion,
  folder: string
): Promise<void> {
  // CDN libraries (example URL):
  // https://ui5.sap.com/test-resources/sap/m/designtime/api.json
  // Older versions:
  // https://ui5.sap.com/1.71.49/test-resources/sap/m/designtime/api.json
  const baseUrl = `https://ui5.sap.com/${version}/test-resources/`;
  const libs = await getLibs(version);
  const nameToFile = zipObject(
    libs,
    map(libs, (_) => `${baseUrl}${_.replace(/\./g, "/")}/designtime/api.json`)
  );

  await mkdirs(folder);

  // Write files in parallel
  await Promise.all(
    map(nameToFile, (url, name) => {
      return writeUrlToFile(
        url,
        resolve(folder, `${name}.designtime.api.json`)
      );
    })
  );
}

async function writeUrlToFile(url: string, file: string): Promise<void> {
  // Don't download the file if it already exists
  if (await pathExists(file)) {
    return;
  }

  log(`fetching from ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    error(`error fetching from ${url}`);
    return;
  }
  const text = await response.text();
  if (text === "{}") {
    // These files don't add anything to the model but they return an error in strict mode
    log(`empty object returned from ${url}`);
    return;
  }
  await writeFile(file, text);
}

type VersionMapJsonType = Record<
  string,
  { version: string; support: string; lts: boolean }
>;

async function getCurrentVersionMaps(
  framework: UI5Framework
): Promise<VersionMapJsonType> {
  const url = `${UI5_FRAMEWORK_CDN_BASE_URL[framework]}version.json`;
  const response = await fetch(url);
  if (response.ok) {
    return (await response.json()) as VersionMapJsonType;
  } else {
    const DEFAULT_FALL_BACK =
      framework === DEFAULT_UI5_FRAMEWORK
        ? DEFAULT_UI5_VERSION
        : DEFAULT_OPEN_UI5_VERSION;
    const data = {};
    data[framework] = {
      latest: {
        version: DEFAULT_FALL_BACK,
        support: "Maintenance",
        lts: true,
      },
    };
    return data;
  }
}

export async function getFallbackPatchVersions(): Promise<
  Record<UI5Framework, string | undefined>
> {
  const result: Record<UI5Framework, string | undefined> = {
    [OPEN_FRAMEWORK]: undefined,
    [DEFAULT_UI5_FRAMEWORK]: undefined,
  };

  result.SAPUI5 = (await getCurrentVersionMaps(DEFAULT_UI5_FRAMEWORK))[
    DEFAULT_UI5_VERSION_BASE
  ]?.version;
  result.OpenUI5 = (await getCurrentVersionMaps(OPEN_FRAMEWORK))[
    DEFAULT_UI5_VERSION_BASE
  ]?.version;
  return result;
}

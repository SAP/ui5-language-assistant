import { UI5Framework } from "@ui5-language-assistant/semantic-model-types";
import {
  UI5_FRAMEWORK_CDN_BASE_URL,
  DEFAULT_OPEN_UI5_VERSION,
  DEFAULT_UI5_VERSION,
} from "@ui5-language-assistant/constant";
import { Fetcher, VersionMapJsonType } from "./types";
import { getLogger } from "./logger";
import { tryFetch, getLocalUrl } from "./fetch-helper";

/**
 * Get CDN URL for UI5 framework. If a URL for `SAPUI5 Web Server` is maintained in settings, it appends UI5 version if available and tries to check if this URL is responding and return it,
 * if it fails, it appends UI5 version if available to a public URL and return it
 *
 * @param framework UI5 framework e.g OpenUI5" | "SAPUI5"
 * @param version min ui5 version specified in manifest.json file
 */
export async function getCDNBaseUrl(
  framework: UI5Framework,
  version: string | undefined
): Promise<string> {
  const localUrl = getLocalUrl(version);
  if (localUrl) {
    const response = await tryFetch(localUrl);
    if (response) {
      return localUrl;
    }

    getLogger().info("Failed to load. Will try over internet.", {
      localUrl,
    });
  }

  let url = UI5_FRAMEWORK_CDN_BASE_URL[framework];
  if (version) {
    url += `${version}/`;
  }
  return url;
}

export function getVersionJsonUrl(framework: UI5Framework): string {
  return `${UI5_FRAMEWORK_CDN_BASE_URL[framework]}version.json`;
}

export async function getVersionInfoUrl(
  framework: UI5Framework,
  version: string
): Promise<string> {
  const cdnBaseUrl = await getCDNBaseUrl(framework, version);
  return `${cdnBaseUrl}resources/sap-ui-version.json`;
}

export async function getLibraryAPIJsonUrl(
  framework: UI5Framework,
  version: string,
  libName: string
): Promise<string> {
  const cdnBaseUrl = await getCDNBaseUrl(framework, version);
  const baseUrl = `${cdnBaseUrl}test-resources/`;
  const suffix = "/designtime/api.json";
  return baseUrl + libName.replace(/\./g, "/") + suffix;
}

// if library is not found, resolve next minor highest patch
const versionMap: Record<UI5Framework, VersionMapJsonType> =
  Object.create(null); // just an in-memory cache!

/**
 * Returns version map for the given framework
 *
 * @param framework The UI5 framework version
 * @param versionJsonFetcher Fetcher function which loads version json
 * @returns Object with versions json
 * @note if it fails to read version mapping, it fallback to default version.
 */
export async function getVersionsMap(
  framework: UI5Framework,
  versionJsonFetcher: Fetcher<VersionMapJsonType>
): Promise<VersionMapJsonType> {
  let versions = versionMap[framework];
  if (versions) {
    return versions;
  }

  // no version information found in the map, retrieve the version mapping using fetcher
  const url = getVersionJsonUrl(framework);
  const response = await versionJsonFetcher(url);
  if (response.ok) {
    versionMap[framework] = await response.json();
  } else {
    const DEFAULT_FALL_BACK =
      framework === "SAPUI5" ? DEFAULT_UI5_VERSION : DEFAULT_OPEN_UI5_VERSION;

    getLogger().error(
      "Could not read version mapping, fallback to default version",
      {
        url,
        DEFAULT_FALL_BACK,
      }
    );
    // update version map with default version only
    versionMap[framework] = {
      latest: {
        version: DEFAULT_FALL_BACK,
        support: "Maintenance",
        lts: true,
      },
    };
  }
  versions = versionMap[framework];

  return versions;
}

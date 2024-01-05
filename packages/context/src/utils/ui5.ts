import { UI5Framework } from "@ui5-language-assistant/semantic-model-types";
import { UI5_FRAMEWORK_CDN_BASE_URL } from "../types";
import { getLogger } from ".";
import { tryFetch, getLocalUrl } from "@ui5-language-assistant/logic-utils";

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

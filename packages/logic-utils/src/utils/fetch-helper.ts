import { getConfigurationSettings } from "@ui5-language-assistant/settings";
import { Response } from "node-fetch";
import { fetch } from "./fetch";

export const getLocalUrl = (
  version?: string,
  config = getConfigurationSettings()
): string | undefined => {
  const webServer = config.SAPUI5WebServer;
  if (webServer) {
    let localUrl = webServer.endsWith("/") ? webServer : `${webServer}/`;

    if (version) {
      localUrl += `${version}/`;
    }
    return localUrl;
  }
  return undefined;
};

/**
 * Try to fetch for a given URI. On fail, it returns undefined
 */
export const tryFetch = async (uri: string): Promise<Response | undefined> => {
  try {
    const response = await fetch(uri);
    if (response.ok) {
      return response;
    }
  } catch (error) {
    return undefined;
  }
  return undefined;
};

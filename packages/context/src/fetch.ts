import { getProxyForUrl } from "proxy-from-env";
import HttpsProxyAgent from "https-proxy-agent";
import { RequestInfo, RequestInit, Response } from "node-fetch";

/**
 * Wrapper for the node-fetch API to utilize a proxy if needed
 * @param url the url to call
 * @param init the init opts
 * @returns a Promise returning the response object
 */
export default async function fetch(
  url: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  // determine the proxy settings for the given url
  const proxy = getProxyForUrl(url) as string;
  // if a proxy has been found we override the agent of
  // the init opts to add the proxy agent
  if (proxy) {
    init = Object.assign({}, init, {
      agent: HttpsProxyAgent(proxy),
    });
  }

  // call the node-fetch API
  let nodeFetch;
  try {
    // this should work when bundled
    nodeFetch = (await import("node-fetch")).default;
  } catch (e) {
    // trying to load dynamically
    const importDynamic = new Function(
      "modulePath",
      "return import(modulePath)"
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nodeFetch = async (...args: any[]) => {
      const module = await importDynamic("node-fetch");
      return module.default(...args);
    };
  }
  return nodeFetch(url, init);
}

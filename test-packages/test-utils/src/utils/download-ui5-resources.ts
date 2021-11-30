import { zipObject, keys, map, noop, isEmpty } from "lodash";
import { resolve } from "path";
import { writeFile, mkdirs, pathExists } from "fs-extra";
import axios, { AxiosInstance } from "axios";
import { getProxySettings } from "get-proxy-settings";
import { httpsOverHttp } from "tunnel";
import { TestModelVersion } from "../../api";

// Disable this flag if you want/need spam/info in the tests logs.
const silent = true;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const log = silent ? noop : (_: string) => console.log(_);
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const error = silent ? noop : (_: string) => console.error(_);

async function getLibs(version: TestModelVersion): Promise<string[]> {
  // The metadata.json seems to have been added only very recently :(
  // For now we assume the libraries are the same in all versions, when we support newer versions we should
  // do a better check here
  let versionInMetadataURL: string = version;
  if (versionInMetadataURL !== "1.76.0") {
    versionInMetadataURL = "1.76.0";
  }
  const url = `/@sapui5/distribution-metadata@${versionInMetadataURL}/metadata.json`;

  const axiosClient = await getAxiosClient(`https://unpkg.com`);
  // console.log(
  //   `${url}@sapui5/distribution-metadata@${versionInMetadataURL}/metadata.json`
  // );

  const response = await axiosClient.get(url);

  if (response.status !== 200) {
    log(`error fetching from ${url}`);
    return [];
  }
  const fileContent = await response.data;
  // const librariesMetadata = JSON.parse(fileContent);
  return keys(fileContent.libraries);
}

export async function addUi5Resources(
  version: TestModelVersion,
  folder: string
): Promise<void> {
  // CDN libraries (example URL):
  // https://sapui5-sapui5.dispatcher.us1.hana.ondemand.com/test-resources/sap/m/designtime/api.json
  // Older versions:
  // https://sapui5.hana.ondemand.com/1.71.14/test-resources/sap/m/designtime/api.json
  const baseUrl = `https://sapui5.hana.ondemand.com/${version}/test-resources/`;
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

async function getAxiosClient(url: string): Promise<AxiosInstance> {
  const proxy = await getProxySettings();
  const baseUrl = url;

  if (proxy?.https) {
    const agent = httpsOverHttp({
      proxy: {
        host: proxy.https.host,
        port: parseInt(proxy.https.port),
        proxyAuth: `${proxy.https.credentials.username}:${proxy.https.credentials.password}`,
      },
    });
    return axios.create({
      baseURL: baseUrl,
      httpsAgent: agent,
      proxy: false,
    });
  } else {
    return axios.create({
      baseURL: baseUrl,
    });
  }
}
async function writeUrlToFile(url: string, file: string): Promise<void> {
  // Don't download the file if it already exists
  if (await pathExists(file)) {
    return;
  }

  log(`fetching from ${url}`);
  const axiosClient = await getAxiosClient(url);
  let text;
  try {
    const response = await axiosClient.get("");
    if (response.status !== 200) {
      error(`error fetching from ${url}`);
      return;
    }
    text = await response.data;

    if (isEmpty(text)) {
      // These files don't add anything to the model but they return an error in strict mode
      log(`empty object returned from ${url}`);
      return;
    }
    const textStr = JSON.stringify(text);
    await writeFile(file, textStr);
  } catch (oError) {
    error(`error fetching from ${url}`);
  }
}

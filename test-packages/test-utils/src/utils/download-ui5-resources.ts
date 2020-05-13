import { zipObject, keys, map, noop } from "lodash";
import { resolve } from "path";
import { writeFile, mkdirs, pathExists } from "fs-extra";
import fetch from "node-fetch";
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
  const url = `https://unpkg.com/@sapui5/distribution-metadata@${versionInMetadataURL}/metadata.json`;
  const response = await fetch(url);
  if (!response.ok) {
    log(`error fetching from ${url}`);
    return [];
  }
  const fileContent = await response.text();
  const librariesMetadata = JSON.parse(fileContent);
  return keys(librariesMetadata.libraries);
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

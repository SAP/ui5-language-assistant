import { TestModelVersion } from "../../api";
import { reduce, keys, map } from "lodash";
import { resolve } from "path";
import { writeFile, mkdirs, pathExists } from "fs-extra";
import fetch from "node-fetch";

async function getLibs(version: TestModelVersion): Promise<string[]> {
  // The metadata.json seems to have been added only very recently :(
  let versionInURL: string = version;
  if (versionInURL !== "1.76.0") {
    versionInURL = "1.76.0";
  }
  const url = `https://unpkg.com/@sapui5/distribution-metadata@${versionInURL}/metadata.json`;
  const response = await fetch(url);
  if (!response.ok) {
    console.log(`error fetching from ${url}`);
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
  const nameToFile = reduce(
    libs,
    (nameToFile, lib) => {
      nameToFile[lib] = `${baseUrl}${lib.replace(
        /\./g,
        "/"
      )}/designtime/api.json`;
      return nameToFile;
    },
    Object.create(null)
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

  console.log(`fetching from ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`error fetching from ${url}`);
    return;
  }
  const text = await response.text();
  if (text === "{}") {
    // These files don't add anything to the model but they return an error in strict mode
    console.log(`empty object returned from ${url}`);
    return;
  }
  await writeFile(file, text);
}

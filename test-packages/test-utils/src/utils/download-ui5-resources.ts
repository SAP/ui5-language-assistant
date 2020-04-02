// This file can be used to download api.json files for UI5 version we want to add to the test directory.
// It is run from the download-resources script in the package.json.
// To get a different version change the version number in the last line of this file.
import { TestModelVersion } from "../../api";
import { reduce, forEach, keys } from "lodash";
import { dirname, resolve } from "path";
import { writeFile, mkdirs } from "fs-extra";
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
  version: TestModelVersion
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

  const pkgJsonPath = require.resolve(
    "@ui5-language-assistant/test-utils/package.json"
  );
  const rootPkgFolder = dirname(pkgJsonPath);
  const modelFolder = resolve(
    rootPkgFolder,
    "resources",
    "model",
    version,
    "input"
  );
  await mkdirs(modelFolder);
  forEach(nameToFile, async (url, name) => {
    await writeUrlToFile(
      url,
      resolve(modelFolder, `${name}.designtime.api.json`)
    );
  });
}

async function writeUrlToFile(url: string, file: string): Promise<void> {
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

addUi5Resources("1.71.14");

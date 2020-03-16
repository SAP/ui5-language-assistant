// This file can be used to download api.json files for UI5 version we want to add to the test directory.
// It is run from the download-resources script in the package.json.
// To get a different version change the version number in the last line of this file.
import { TestModelVersion } from "../../api";
import { reduce, forEach, keys } from "lodash";
import { dirname, resolve } from "path";
import { writeFileSync, mkdirsSync, readFileSync } from "fs-extra";
import fetch from "node-fetch";

async function getLibs(): Promise<string[]> {
  // To fetch the metadata.json file dynamically by version do the following:
  // 1. Add these devDependencies in the package.json:
  //     "jszip": "3.2.2",
  //     "@types/jszip": "3.1.7"
  // Note: this requires the typescript compiler to be aware of the dom types,
  // which is done by adding "dom" to "lib" in tsconfig.base.json
  //
  // 2. Add this import:
  // import { loadAsync } from "jszip";
  //
  // 3. Add parameter "version: TestModelVersion" and pass the version where this function is called
  //
  // 4. Uncomment the following code:
  // The metadata.json seems to have been added only very recently :(
  // let versionInURL: string = version;
  // if (versionInURL !== "1.75.0") {
  //   versionInURL = "1.75.0";
  // }
  // const url = `http://nexusrel.wdf.sap.corp:8081/nexus/service/local/repositories/deploy.releases/content/com/sap/ui5/dist/sapui5-dist/${versionInURL}/sapui5-dist-${versionInURL}-npm-sources.zip`;
  // const response = await fetch(url);
  // if (!response.ok) {
  //   console.log(`error fetching from ${url}`);
  //   return [];
  // }
  //
  // const zipResponse = await response.buffer();
  // const zip = await loadAsync(zipResponse);
  // const fileContent = await zip.file("metadata.json").async("string");
  //
  // 5. Remove the following code (until the definition of fileContent)
  const pkgJsonPath = require.resolve(
    "@ui5-language-assistant/test-utils/package.json"
  );
  const rootPkgFolder = dirname(pkgJsonPath);
  // The content of this file was copied from the URL above (for version 1.75.0), from file metadata.json inside the zip
  const metadataFile = resolve(
    rootPkgFolder,
    "resources",
    "model",
    "metadata.json"
  );
  const fileContent = readFileSync(metadataFile, "UTF-8");

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
  const libs = await getLibs();
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
  mkdirsSync(modelFolder);
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
  writeFileSync(file, text);
}

addUi5Resources("1.71.14");

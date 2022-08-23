import { dirname } from "path";
import { maxBy, map, filter } from "lodash";
import { readFile } from "fs-extra";
import { URI } from "vscode-uri";
import globby from "globby";
import { FileChangeType } from "vscode-languageserver";
import { loadAll } from "js-yaml";

import { getLogger } from "./logger";
import { UI5Framework } from "@ui5-language-assistant/semantic-model-types";

type AbsolutePath = string;
type UI5YamlData = Record<
  AbsolutePath,
  { framework: UI5Framework; version: string }
>;
const ui5YamlData: UI5YamlData = Object.create(null);

export function isUI5YamlDoc(uri: string): boolean {
  return uri.endsWith("ui5.yaml");
}

export async function initializeUI5YamlData(
  workspaceFolderPath: string
): Promise<void[]> {
  const ui5YamlDocuments = await findAllUI5YamlDocumentsInWorkspace(
    workspaceFolderPath
  );

  const readUI5YamlPromises = map(ui5YamlDocuments, async (ui5YamlDoc) => {
    const response = await readUI5YamlFile(ui5YamlDoc);

    // Parsing of ui5.yaml failed because the file is invalid
    if (response !== "INVALID") {
      ui5YamlData[ui5YamlDoc] = response;
    }
  });

  getLogger().info("ui5.yaml data initialized", { ui5YamlDocuments });
  return Promise.all(readUI5YamlPromises);
}

export function getUI5FrameworkForXMLFile(xmlPath: string): UI5Framework {
  const ui5YamlFilesForCurrentFolder = filter(
    Object.keys(ui5YamlData),
    (ui5YamlPath) => xmlPath.startsWith(dirname(ui5YamlPath))
  );

  const closestUI5YamlPath = maxBy(
    ui5YamlFilesForCurrentFolder,
    (ui5YamlPath) => ui5YamlPath.length
  );

  return closestUI5YamlPath
    ? ui5YamlData[closestUI5YamlPath].framework
    : "SAPUI5";
}

export function getVersionForXMLFile(xmlPath: string): string | undefined {
  const ui5YamlFilesForCurrentFolder = filter(
    Object.keys(ui5YamlData),
    (ui5YamlPath) => xmlPath.startsWith(dirname(ui5YamlPath))
  );

  const closestUI5YamlPath = maxBy(
    ui5YamlFilesForCurrentFolder,
    (ui5YamlPath) => ui5YamlPath.length
  );

  if (closestUI5YamlPath === undefined) {
    return undefined;
  }

  return ui5YamlData[closestUI5YamlPath].version;
}

export async function updateUI5YamlData(
  ui5YamlUri: string,
  changeType: FileChangeType
): Promise<void> {
  getLogger().debug("`updateUI5YamlData` function called", {
    ui5YamlUri,
    changeType,
  });
  const ui5YamlPath = URI.parse(ui5YamlUri).fsPath;
  switch (changeType) {
    case 1: //created
    case 2: {
      //changed
      const response = await readUI5YamlFile(ui5YamlUri);
      // Parsing of ui5Yaml.json failed because the file is invalid
      // We want to keep last successfully read state - manifset.json file may be actively edited
      if (response !== "INVALID") {
        ui5YamlData[ui5YamlPath] = response;
      }
      return;
    }
    case 3: //deleted
      delete ui5YamlData[ui5YamlPath];
      return;
  }
}

async function findAllUI5YamlDocumentsInWorkspace(
  workspaceFolderPath: string
): Promise<string[]> {
  return globby(`${workspaceFolderPath}/**/ui5.yaml`);
}

async function readUI5YamlFile(
  ui5YamlUri: string
): Promise<{ framework: UI5Framework; version: string } | "INVALID"> {
  const ui5YamlContent = await readFile(URI.parse(ui5YamlUri).fsPath, "utf-8");

  // find the first section in the ui5.yaml declaring the framework
  let ui5YamlDocs, ui5YamlObject;
  try {
    ui5YamlDocs = loadAll(ui5YamlContent);
    ui5YamlObject = ui5YamlDocs.find((ui5YamlDoc) => {
      return /^(OpenUI5|SAPUI5)$/i.test(ui5YamlDoc?.framework?.name);
    });
  } catch (err) {
    ui5YamlObject = undefined;
  }

  // extract the framework and the version from the yaml
  if (ui5YamlObject) {
    const framework = ui5YamlObject?.framework?.name;
    const version = ui5YamlObject?.framework?.version;
    return { framework, version };
  } else {
    return "INVALID";
  }
}

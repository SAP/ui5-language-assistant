import { dirname } from "path";
import { maxBy, map, filter } from "lodash";
import { readFile } from "fs-extra";
import { URI } from "vscode-uri";
import globby from "globby";
import { FileChangeType } from "vscode-languageserver";
import { loadAll } from "js-yaml";
import { DEFAULT_UI5_FRAMEWORK, YamlDetails } from "./types";
import { UI5Framework } from "@ui5-language-assistant/semantic-model-types";
import { FileName } from "@sap-ux/project-access";
import findUp from "find-up";
import { cache } from "./cache";

export async function initializeUI5YamlData(
  workspaceFolderPath: string
): Promise<void[]> {
  const ui5YamlDocuments = await findAllUI5YamlDocumentsInWorkspace(
    workspaceFolderPath
  );

  const readUI5YamlPromises = map(ui5YamlDocuments, async (ui5YamlDoc) => {
    const response = await readUI5YamlFile(ui5YamlDoc);

    if (response) {
      cache.setYamlDetails(ui5YamlDoc, response);
      console.info("ui5.yaml data initialized", { ui5YamlDoc });
    }
  });

  console.info("list of ui5.yaml files", { ui5YamlDocuments });
  return Promise.all(readUI5YamlPromises);
}

export function getUI5FrameworkForXMLFile(xmlPath: string): UI5Framework {
  const ui5YamlFilesForCurrentFolder = filter(
    cache.getYamlDetailsEntries(),
    (ui5YamlPath) => xmlPath.startsWith(dirname(ui5YamlPath))
  );

  const closestUI5YamlPath = maxBy(
    ui5YamlFilesForCurrentFolder,
    (ui5YamlPath) => ui5YamlPath.length
  );
  if (closestUI5YamlPath) {
    return cache.getYamlDetails(closestUI5YamlPath)?.framework ?? "OpenUI5";
  }
  return "OpenUI5";
}

export function getVersionForXMLFile(xmlPath: string): string | undefined {
  const ui5YamlFilesForCurrentFolder = filter(
    cache.getYamlDetailsEntries(),
    (ui5YamlPath) => xmlPath.startsWith(dirname(ui5YamlPath))
  );

  const closestUI5YamlPath = maxBy(
    ui5YamlFilesForCurrentFolder,
    (ui5YamlPath) => ui5YamlPath.length
  );

  if (closestUI5YamlPath === undefined) {
    return undefined;
  }
  if (closestUI5YamlPath) {
    return cache.getYamlDetails(closestUI5YamlPath)?.version;
  }
  return undefined;
}

async function findAllUI5YamlDocumentsInWorkspace(
  workspaceFolderPath: string
): Promise<string[]> {
  return globby(`${workspaceFolderPath}/**/ui5.yaml`).catch((reason) => {
    console.error(`Failed to find all ui5.yaml files in current workspace!`, {
      workspaceFolderPath,
      reason,
    });
    return [];
  });
}

async function readUI5YamlFile(
  ui5YamlUri: string
): Promise<YamlDetails | undefined> {
  // find the first section in the ui5.yaml declaring the framework
  let ui5YamlDocs, ui5YamlObject;
  try {
    const ui5YamlContent = await readFile(
      URI.parse(ui5YamlUri).fsPath,
      "utf-8"
    );
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
  }
  return undefined;
}
/**
 * Get path of a yaml file
 * @param documentPath path to a file i.e absolute/path/webapp/ext/main/Main.view.xml
 */
export async function findYamlPath(
  documentPath: string
): Promise<string | undefined> {
  return findUp(FileName.Ui5Yaml, { cwd: documentPath });
}

/**
 * Get yaml of an app
 * @param ui5YamlRoot absolute root to a yaml file of an app i.e /some/other/path/parts/app/manage_travels/webapp/ui5.yaml
 */
export async function getUI5Yaml(
  ui5YamlRoot: string
): Promise<YamlDetails | undefined> {
  const cachedYaml = cache.getYamlDetails(ui5YamlRoot);
  if (cachedYaml) {
    return cachedYaml;
  }
  try {
    const data = await readUI5YamlFile(ui5YamlRoot);
    if (data) {
      cache.setYamlDetails(ui5YamlRoot, data);
    }
    return data;
  } catch {
    return undefined;
  }
}

/**
 * Get details of a yaml file. By default return UI5 framework
 * @param documentPath path to a file i.e absolute/path/webapp/ext/main/Main.view.xml
 */
export async function getYamlDetails(
  documentPath: string
): Promise<YamlDetails> {
  const yamlPath = await findYamlPath(documentPath);
  if (!yamlPath) {
    return { framework: DEFAULT_UI5_FRAMEWORK, version: undefined };
  }
  const yamlData = await getUI5Yaml(yamlPath);
  if (yamlData) {
    return yamlData;
  }
  return { framework: DEFAULT_UI5_FRAMEWORK, version: undefined };
}

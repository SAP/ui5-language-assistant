import { dirname } from "path";
import { maxBy, map, filter } from "lodash";
import { readFile } from "fs-extra";
import { URI } from "vscode-uri";
import { loadAll } from "js-yaml";
import { YamlDetails } from "./types";
import { FileName } from "@sap-ux/project-access";
import findUp from "find-up";
import { cache } from "./cache";
import { getLogger } from "./utils";
import { findAllFilesInWorkspace } from "./utils/fileUtils";
import { DEFAULT_UI5_FRAMEWORK } from "@ui5-language-assistant/constant";

export async function initializeUI5YamlData(
  workspaceFolderPath: string
): Promise<void[]> {
  const ui5YamlDocuments = await findAllFilesInWorkspace(
    workspaceFolderPath,
    "ui5.yaml"
  );

  const readUI5YamlPromises = map(ui5YamlDocuments, async (ui5YamlDoc) => {
    const response = await readUI5YamlFile(ui5YamlDoc);

    if (response) {
      cache.setYamlDetails(ui5YamlDoc, response);
      getLogger().info("ui5.yaml data initialized", { ui5YamlDoc });
    }
  });

  getLogger().info("list of ui5.yaml files", { ui5YamlDocuments });
  return Promise.all(readUI5YamlPromises);
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

  if (closestUI5YamlPath) {
    return cache.getYamlDetails(closestUI5YamlPath)?.version;
  }
  return undefined;
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
    getLogger().debug("readUI5YamlFile failed:", err);
    ui5YamlObject = undefined;
  }

  // extract the framework and the version from the yaml
  if (ui5YamlObject) {
    const framework = ui5YamlObject.framework?.name;
    const version = ui5YamlObject.framework?.version;
    return { framework, version };
  }
  return undefined;
}
/**
 * Get path of a yaml file
 * @param documentPath path to a file e.g. absolute/path/webapp/ext/main/Main.view.xml
 */
export async function findYamlPath(
  documentPath: string
): Promise<string | undefined> {
  return await findUp(FileName.Ui5Yaml, { cwd: documentPath });
}

/**
 * Get yaml of an app
 * @param ui5YamlRoot absolute root to a yaml file of an app e.g. /some/other/path/parts/app/manage_travels/webapp/ui5.yaml
 */
export async function getUI5Yaml(
  ui5YamlRoot: string,
  ignoreCache?: boolean
): Promise<YamlDetails | undefined> {
  const cachedYaml = cache.getYamlDetails(ui5YamlRoot);
  if (cachedYaml && !ignoreCache) {
    return cachedYaml;
  }
  const data = await readUI5YamlFile(ui5YamlRoot);
  if (data) {
    cache.setYamlDetails(ui5YamlRoot, data);
  }
  return data;
}

/**
 * Get details of a yaml file. By default return UI5 framework
 * @param documentPath path to a file e.g. absolute/path/webapp/ext/main/Main.view.xml
 */
export async function getYamlDetails(
  documentPath: string,
  ignoreCache?: boolean
): Promise<YamlDetails> {
  const yamlPath = await findYamlPath(documentPath);
  if (!yamlPath) {
    return { framework: DEFAULT_UI5_FRAMEWORK, version: undefined };
  }
  const yamlData = await getUI5Yaml(yamlPath, ignoreCache);
  if (yamlData) {
    return yamlData;
  }
  return { framework: DEFAULT_UI5_FRAMEWORK, version: undefined };
}

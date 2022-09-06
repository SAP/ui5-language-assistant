import { dirname } from "path";
import { maxBy, map, filter } from "lodash";
import { readFile } from "fs-extra";
import { URI } from "vscode-uri";
import globby from "globby";
import { FileChangeType } from "vscode-languageserver";
import { getLogger } from "./logger";
import * as propertiesParser from "properties-file/content";
import { Property } from "properties-file";

type AbsolutePath = string;
type ResourceBundleData = Record<AbsolutePath, Property[]>;
const resourceBundleData: ResourceBundleData = Object.create(null);

export function isResourceBundleDoc(uri: string): boolean {
  return uri.endsWith("i18n.properties");
}

export async function initializeResourceBundleData(
  workspaceFolderPath: string
): Promise<void[]> {
  const resourceBundleDocuments = await findAllResourceBundleDocumentsInWorkspace(
    workspaceFolderPath
  );

  const readResourceBundlePromises = map(
    resourceBundleDocuments,
    async (resourceBundleDoc) => {
      const response = await readResourceBundleFile(resourceBundleDoc);

      // Parsing of i18n.properties failed because the file is invalid
      if (response !== "INVALID") {
        resourceBundleData[resourceBundleDoc] = response;
      }
    }
  );

  getLogger().info("resourceBundle data initialized", {
    resourceBundleDocuments,
  });
  return Promise.all(readResourceBundlePromises);
}

export function getResourceBundleData(documentPath: string): Property[] {
  const resourceBundleFilesForCurrentFolder = filter(
    Object.keys(resourceBundleData),
    (resourceBundlePath) =>
      documentPath.startsWith(dirname(resourceBundlePath.replace("/i18n", "")))
  );

  const closestResourceBundlePath = maxBy(
    resourceBundleFilesForCurrentFolder,
    (resourceBundlePath) => resourceBundlePath.length
  );

  if (closestResourceBundlePath === undefined) {
    return [];
  }

  return resourceBundleData[closestResourceBundlePath];
}

export async function updateResourceBundleData(
  resourceBundleUri: string,
  changeType: FileChangeType
): Promise<void> {
  getLogger().debug("`updateResourceBundleData` function called", {
    resourceBundleUri,
    changeType,
  });
  const resourceBundlePath = URI.parse(resourceBundleUri).fsPath;
  switch (changeType) {
    case 1: //created
    case 2: {
      //changed
      const response = await readResourceBundleFile(resourceBundleUri);
      // Parsing of i18n.properties failed because the file is invalid
      // We want to keep last successfully read state - i18n.properties file may be actively edited
      if (response !== "INVALID") {
        resourceBundleData[resourceBundlePath] = response;
      }
      return;
    }
    case 3: //deleted
      delete resourceBundleData[resourceBundlePath];
      return;
  }
}

async function findAllResourceBundleDocumentsInWorkspace(
  workspaceFolderPath: string
): Promise<string[]> {
  return globby(`${workspaceFolderPath}/**/i18n.properties`).catch((reason) => {
    getLogger().error(
      `Failed to find all i18n.properties files in current workspace!`,
      {
        workspaceFolderPath,
        reason,
      }
    );
    return [];
  });
}

async function readResourceBundleFile(
  resourceBundleUri: string
): Promise<Property[] | "INVALID"> {
  const resourceBundleContent = await readFile(
    URI.parse(resourceBundleUri).fsPath,
    "utf-8"
  );

  let resourceBundleObject: Property[];
  try {
    resourceBundleObject = propertiesParser.getProperties(resourceBundleContent)
      .collection;
  } catch (err) {
    return "INVALID";
  }

  return resourceBundleObject;
}

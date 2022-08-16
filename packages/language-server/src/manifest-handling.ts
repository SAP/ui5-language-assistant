import { dirname } from "path";
import { maxBy, map, filter } from "lodash";
import { readFile } from "fs-extra";
import { URI } from "vscode-uri";
import globby from "globby";
import { FileChangeType } from "vscode-languageserver";
import { getLogger } from "./logger";

type AbsolutePath = string;
type ManifestData = Record<
  AbsolutePath,
  { flexEnabled: boolean; minUI5Version: string }
>;
const manifestData: ManifestData = Object.create(null);

export function isManifestDoc(uri: string): boolean {
  return uri.endsWith("manifest.json");
}

export async function initializeManifestData(
  workspaceFolderPath: string
): Promise<void[]> {
  const manifestDocuments = await findAllManifestDocumentsInWorkspace(
    workspaceFolderPath
  );

  const readManifestPromises = map(manifestDocuments, async (manifestDoc) => {
    const response = await readManifestFile(manifestDoc);

    // Parsing of manifest.json failed because the file is invalid
    if (response !== "INVALID") {
      manifestData[manifestDoc] = response;
    }
  });

  getLogger().info("manifest data initialized", { manifestDocuments });
  return Promise.all(readManifestPromises);
}

export function getFlexEnabledFlagForXMLFile(xmlPath: string): boolean {
  const manifestFilesForCurrentFolder = filter(
    Object.keys(manifestData),
    (manifestPath) => xmlPath.startsWith(dirname(manifestPath))
  );

  const closestManifestPath = maxBy(
    manifestFilesForCurrentFolder,
    (manifestPath) => manifestPath.length
  );

  if (closestManifestPath === undefined) {
    return false;
  }

  return manifestData[closestManifestPath].flexEnabled;
}

export function getMinUI5VersionForXMLFile(
  xmlPath: string
): string | undefined {
  const manifestFilesForCurrentFolder = filter(
    Object.keys(manifestData),
    (manifestPath) => xmlPath.startsWith(dirname(manifestPath))
  );

  const closestManifestPath = maxBy(
    manifestFilesForCurrentFolder,
    (manifestPath) => manifestPath.length
  );

  if (closestManifestPath === undefined) {
    return undefined;
  }

  return manifestData[closestManifestPath].minUI5Version;
}

export async function updateManifestData(
  manifestUri: string,
  changeType: FileChangeType
): Promise<void> {
  getLogger().debug("`updateManifestData` function called", {
    manifestUri,
    changeType,
  });
  const manifestPath = URI.parse(manifestUri).fsPath;
  switch (changeType) {
    case 1: //created
    case 2: {
      //changed
      const response = await readManifestFile(manifestUri);
      // Parsing of manifest.json failed because the file is invalid
      // We want to keep last successfully read state - manifset.json file may be actively edited
      if (response !== "INVALID") {
        manifestData[manifestPath] = response;
      }
      return;
    }
    case 3: //deleted
      delete manifestData[manifestPath];
      return;
  }
}

async function findAllManifestDocumentsInWorkspace(
  workspaceFolderPath: string
): Promise<string[]> {
  return globby(`${workspaceFolderPath}/**/manifest.json`);
}

async function readManifestFile(
  manifestUri: string
): Promise<{ flexEnabled: boolean; minUI5Version: string } | "INVALID"> {
  const manifestContent = await readFile(
    URI.parse(manifestUri).fsPath,
    "utf-8"
  );

  let manifestJsonObject;
  try {
    manifestJsonObject = JSON.parse(manifestContent);
  } catch (err) {
    return "INVALID";
  }

  const flexEnabled = manifestJsonObject["sap.ui5"]?.flexEnabled;
  const minUI5Version =
    manifestJsonObject["sap.ui5"]?.dependencies?.minUI5Version;

  return { flexEnabled: flexEnabled, minUI5Version: minUI5Version };
}

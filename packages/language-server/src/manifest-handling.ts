import { maxBy, map, filter } from "lodash";
import { readFile } from "fs-extra";
import { URI } from "vscode-uri";
import { dirname } from "path";
import globby from "globby";
import { FileChangeType } from "vscode-languageserver";

type AbsolutePath = string;
type ManifestData = Record<AbsolutePath, { isFlexEnabled: boolean }>;
const manifestData: ManifestData = Object.create(null);
let manifestDocuments: string[];

export function isManifestDoc(uri: string): boolean {
  return uri.endsWith("manifest.json");
}

export async function initializeManifestDocuments(
  workspaceFolderPath: string
): Promise<void[]> {
  manifestDocuments = await findAllManifestDocumentsInWorkspace(
    workspaceFolderPath
  );
  const readManifestPromises = map(manifestDocuments, async (manifestDoc) => {
    const isFlexEnabled = await readFlexEnabledFlagFromManifestFile(
      manifestDoc
    );
    // Parsing of manifest.json failed because the file is invalid
    if (isFlexEnabled !== "INVALID") {
      manifestData[manifestDoc] = { isFlexEnabled };
    }
  });

  return Promise.all(readManifestPromises);
}

export function getFlexEnabledFlagForXMLFile(xmlPath: string): boolean {
  const manifestFilesForCurrentFolder = filter(
    Object.keys(manifestData),
    (manifestPath) => xmlPath.includes(dirname(manifestPath))
  );
  const requiredManifestPath = maxBy(
    manifestFilesForCurrentFolder,
    (manifestPath) => manifestPath.length
  );

  if (requiredManifestPath === undefined) {
    return false;
  }

  return manifestData[requiredManifestPath].isFlexEnabled;
}

export async function updateManifestData(
  manifestUri: string,
  changeType: FileChangeType
): Promise<void> {
  const isFlexEnabled = await readFlexEnabledFlagFromManifestFile(manifestUri);
  const manifestPath = URI.parse(manifestUri).fsPath;
  switch (changeType) {
    case 1: //created
    case 2: //changed
      // Parsing of manifest.json failed because the file is invalid
      if (isFlexEnabled !== "INVALID") {
        manifestData[manifestPath] = { isFlexEnabled };
      }
      return;
    case 3: //deleted
      delete manifestData[manifestPath];
      return;
  }
}

async function findAllManifestDocumentsInWorkspace(
  workspaceFolderPath: string
): Promise<string[]> {
  return globby(`${workspaceFolderPath}/**/manifest.json`, {
    cwd: `${workspaceFolderPath}`,
  });
}

async function readFlexEnabledFlagFromManifestFile(
  manifestUri: string
): Promise<boolean | "INVALID"> {
  const manifestContent = await readFile(
    URI.parse(manifestUri).fsPath,
    "utf-8"
  );
  let manifestJsonObject;
  try {
    manifestJsonObject = JSON.parse(manifestContent);
  } catch (err) {
    console.log(err);
    return "INVALID";
  }

  const ui5Object = manifestJsonObject["sap.ui5"] ?? { flexEnabled: false };
  const isFlexEnabled = ui5Object.flexEnabled;

  return isFlexEnabled;
}

import { findAppRoot, getProjectRoot, getProjectInfo } from "./utils";
import {
  findManifestPath,
  getMainService,
  getManifestDetails,
  getUI5Manifest,
} from "./manifest";
import { getProject, getApp } from "./loader";
import { cache } from "./cache";
import { Manifest } from "@sap-ux/project-access";
import { FileChangeType } from "vscode-languageserver";
import { URI } from "vscode-uri";
import { getYamlDetails } from "./ui5-yaml";
import { join } from "path";
import { FileName } from "@sap-ux/project-access";

/**
 * React on manifest.json file change
 *
 * @param uri uri to manifest.json file
 * @description
 * a. remove manifest cache
 *
 * b. remove app cache
 *
 * c. remove project cache
 *
 * d. get a fresh project
 */
export const reactOnManifestChange = async (
  manifestUri: string,
  changeType: FileChangeType
): Promise<void> => {
  console.debug("`reactOnManifestChange` function called", {
    manifestUri,
    changeType,
  });
  const manifestPath = URI.parse(manifestUri).fsPath;
  const projectRoot = await getProjectRoot(manifestPath);
  if (!projectRoot) {
    return;
  }
  // remove manifest cache
  cache.deleteManifest(manifestPath);
  const cachedProject = cache.getProject(projectRoot);
  if (!cachedProject) {
    return;
  }
  if (cachedProject.type == "CAP") {
    for (const [, app] of cachedProject.apps) {
      const appRoot = app.appRoot;
      // remove cached app
      cache.deleteApp(appRoot);
    }
  }
  if (cachedProject.type === "UI5") {
    // remove app cache
    cache.deleteApp(cachedProject.root);
  }
  // remove project cache
  cache.deleteProject(projectRoot);
  // get a fresh project
  await getProject(manifestPath);
};
/**
 * React on UI5 yaml file change
 *
 * @param uri uri to ui5.yaml file
 * @param changeType change type
 * @description
 * 1. for change or create operation:
 *
 *    a. fresh UI5 yaml entry is added to cache
 *
 * 2. for delete operation:
 *
 *     a. cached yaml entry is removed from cache
 */
export const reactOnUI5YamlChange = async (
  ui5YamlUri: string,
  changeType: FileChangeType
): Promise<void> => {
  console.debug("`updateUI5YamlData` function called", {
    ui5YamlUri,
    changeType,
  });
  const ui5YamlPath = URI.parse(ui5YamlUri).fsPath;
  switch (changeType) {
    case 1: //created
    case 2: {
      //changed
      const response = await getYamlDetails(ui5YamlUri);
      // We want to keep last successfully read state - yaml file may be actively edited
      cache.setYamlDetails(ui5YamlPath, response);
      return;
    }
    case 3: //deleted
      cache.deleteYamlDetails(ui5YamlPath);
      return;
  }
};

/**
 * Get fresh app and assign it to cap project CAP
 *
 * @param uri uri to a cds file
 * @param changeType change type
 * @description in case of a cds change
 *
 * a. remove cap service cache and a fresh cap service entry is added to cache when `getApp` is called
 *
 * b. remove app cache and a fresh app entry is added to cache
 *
 * c. fresh app is assigned to CAP project apps
 * @note in case of not being able to create a fresh app, cached app from project apps is removed
 */
export const reactOnCdsFileChange = async (
  uri: string,
  changeType: FileChangeType
): Promise<void> => {
  console.debug("`reactOnCdsFileChange` function called", {
    cdsUri: uri,
    changeType,
  });
  const documentPath = URI.parse(uri).fsPath;
  const projectRoot = await getProjectRoot(documentPath);
  if (!projectRoot) {
    return;
  }
  // remove cap services cache
  cache.deleteCapServices(projectRoot);

  const cachedProject = cache.getProject(projectRoot);
  if (!cachedProject) {
    return;
  }
  if (cachedProject.type !== "CAP") {
    return;
  }
  for (const [, app] of cachedProject.apps) {
    const appRoot = app.appRoot;
    const manifestRoot = join(appRoot, FileName.Manifest);
    const manifest = await getUI5Manifest(manifestRoot);
    if (!manifest) {
      continue;
    }
    const manifestDetails = await getManifestDetails(manifestRoot);
    const projectInfo = await getProjectInfo(projectRoot);
    // remove cached app
    cache.deleteApp(appRoot);
    const freshApp = await getApp(
      projectRoot,
      appRoot,
      manifest,
      manifestDetails,
      projectInfo
    );
    if (!freshApp) {
      // remove cached app from project apps
      cachedProject.apps.delete(appRoot);
      continue;
    }
    // assign fresh app to CAP project
    cachedProject.apps.set(appRoot, freshApp);
  }
};

const isAnnotationDocumentChange = (
  uri: string,
  manifest: Manifest
): boolean => {
  const mainServiceName = getMainService(manifest);
  const dataSources = manifest["sap.app"]?.dataSources;
  if (dataSources && mainServiceName !== undefined) {
    const dataSource = dataSources[mainServiceName];
    const annotationFilePaths = (dataSource?.settings?.annotations ?? [])
      .map((name) => dataSources[name]?.settings?.localUri)
      .filter((path): path is string => !!path);
    // check metadata
    const defaultModelDataSource = dataSources[mainServiceName];
    const metadataLocalUri = defaultModelDataSource?.settings?.localUri;
    for (const filePath of annotationFilePaths) {
      if (uri.endsWith(filePath)) {
        return true;
      }
    }
    if (metadataLocalUri && uri.endsWith(metadataLocalUri)) {
      return true;
    }
  }
  return false;
};

/**
 * React to an xml annotation file change. It reacts to only in manifest.json registered annotation files
 * @param uri uri to an xml file
 * @param changeType change type
 * @description
 * a. remove app cache
 *
 * b. remove project cache
 *
 * c. get a fresh project
 */
export const reactOnXmlFileChange = async (
  uri: string,
  changeType: FileChangeType
): Promise<void> => {
  console.debug("`reactOnXmlFileChange` function called", {
    xmlUri: uri,
    changeType,
  });
  const documentPath = URI.parse(uri).fsPath;
  const manifestPath = await findManifestPath(documentPath);
  if (!manifestPath) {
    return;
  }
  const manifest = await getUI5Manifest(manifestPath);
  if (!manifest) {
    return;
  }
  if (!isAnnotationDocumentChange(uri, manifest)) {
    return;
  }
  const projectRoot = await getProjectRoot(documentPath);
  if (!projectRoot) {
    return;
  }
  const appRoot = await findAppRoot(documentPath);
  if (!appRoot) {
    return;
  }
  // remove app cache
  cache.deleteApp(appRoot);
  // remove project cache
  cache.deleteProject(projectRoot);
  // get a fresh project
  await getProject(documentPath);
};

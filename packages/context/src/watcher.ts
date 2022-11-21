import { fileURLToPath } from "url";
import { findAppRoot, getProjectInfo, getProjectRoot } from "../src/utils";
import { readManifestFile } from "../src/manifest";
import { getApp } from "./loader";
import { cache } from "./cache";
import { getManifestDetails, getUI5Manifest } from "./manifest";
import { FileName } from "@sap-ux/project-access";
import { join } from "path";
import { FileChangeType } from "vscode-languageserver";
import { URI } from "vscode-uri";
import { readUI5YamlFile } from "./ui5-yaml";

const handleManifestFileChange = async (
  manifestPath: string
): Promise<void> => {
  const projectRoot = await getProjectRoot(manifestPath);
  if (!projectRoot) {
    return;
  }
  const appRoot = await findAppRoot(manifestPath);
  if (!appRoot) {
    return;
  }
  const manifest = await getUI5Manifest(manifestPath);
  if (!manifest) {
    return;
  }
  const manifestDetails = await getManifestDetails(manifestPath);
  const projectInfo = await getProjectInfo(projectRoot);
  // remove cached app
  cache.deleteApp(appRoot);
  const app = await getApp(
    projectRoot,
    appRoot,
    manifest,
    manifestDetails,
    projectInfo
  );
  if (!app) {
    return;
  }
  const cachedCapProject = cache.getProject(projectRoot);
  if (cachedCapProject) {
    if (cachedCapProject.type === "CAP") {
      cachedCapProject.apps.set(appRoot, app);
    } else {
      cachedCapProject.app = app;
    }
  }
};
/**
 * React on manifest.json file change
 *
 * @param uri uri to manifest.json file
 * @description
 * 1. for change or create operation:
 *
 *    a. fresh manifest entry is added to cache
 *
 *    b. cached entry of app is removed and a fresh app entry is added to cache
 *
 *    c. fresh app is assigned to respective UI5 or CAP project app(s)
 *
 * 2. for delete operation:
 *
 *     a. cached manifest entry is removed from cache
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
  switch (changeType) {
    case 1: //created
    case 2: {
      //changed
      const response = await readManifestFile(manifestUri);
      // We want to keep last successfully read state - manifest.json file may be actively edited
      if (response) {
        cache.setManifest(manifestPath, response);
      }
      await handleManifestFileChange(manifestPath);
      return;
    }
    case 3: //deleted
      cache.deleteManifest(manifestPath);
      return;
  }
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
      const response = await readUI5YamlFile(ui5YamlUri);
      // We want to keep last successfully read state - yaml file may be actively edited
      if (response) {
        cache.setYamlDetails(ui5YamlPath, response);
      }
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
 * a. cached entry of cap service is remove and a fresh cap service entry is added to cache when `getApp` is called
 *
 * b. cached entry of app is removed and a fresh app entry is added to cache
 *
 * c. fresh app is assigned to CAP project apps
 * @note in case of not being able to create a fresh app, cached app from project apps is removed
 */
export const reactOnCdsFileChange = async (
  uri: string,
  changeType: FileChangeType
): Promise<void> => {
  const documentPath = fileURLToPath(uri);
  const projectRoot = await getProjectRoot(documentPath);
  if (!projectRoot) {
    return;
  }
  // remove cached cap services
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
    const manifestDetails = await getManifestDetails(documentPath);
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

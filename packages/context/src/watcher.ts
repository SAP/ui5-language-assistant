import {
  findAppRoot,
  getProjectRoot,
  getProjectInfo,
  getLogger,
} from "./utils";
import {
  findManifestPath,
  getMainService,
  getManifestDetails,
  getUI5Manifest,
} from "./manifest";
import { getProject, getApp } from "./loader";
import { cache } from "./cache";
import { Manifest } from "@sap-ux/project-access";
import { FileChangeType, FileEvent } from "vscode-languageserver/node";
import { URI } from "vscode-uri";
import { getYamlDetails } from "./ui5-yaml";
import { join } from "path";
import { FileName } from "@sap-ux/project-access";
import { CAP_PROJECT_TYPE, UI5_PROJECT_TYPE } from "./types";
import { isXMLView } from "@ui5-language-assistant/logic-utils";

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
  getLogger().debug("`reactOnManifestChange` function called", {
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
  if (cachedProject.type == CAP_PROJECT_TYPE) {
    const appRoot = await findAppRoot(manifestPath);
    if (appRoot) {
      cache.deleteApp(appRoot);
    }
  }
  if (cachedProject.type === UI5_PROJECT_TYPE) {
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
  getLogger().debug("`updateUI5YamlData` function called", {
    ui5YamlUri,
    changeType,
  });
  const ui5YamlPath = URI.parse(ui5YamlUri).fsPath;
  switch (changeType) {
    case 1: //created
    case 2: {
      //changed
      const response = await getYamlDetails(ui5YamlPath, true);
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
 * Get fresh app and assign it to CAP project
 *
 * @param uri uri to a cds file
 * @param changeType change type
 * @description in case of a cds change
 *
 * a. remove CAP service cache and a fresh CAP service entry is added to cache when `getApp` is called
 *
 * b. remove app cache and a fresh app entry is added to cache
 *
 * c. fresh app is assigned to CAP project apps
 * @note in case of not being able to create a fresh app, cached app from project apps is removed
 * @note all project roots are collected to avoid recompilation and processing
 */
export const reactOnCdsFileChange = async (
  fileEvents: FileEvent[]
): Promise<void> => {
  const projectRoots = new Set<string>();
  for (const { uri, type } of fileEvents) {
    getLogger().debug("`reactOnCdsFileChange` function called", {
      cdsUri: uri,
      changeType: type,
    });
    const documentPath = URI.parse(uri).fsPath;
    const projectRoot = await getProjectRoot(documentPath);
    if (!projectRoot) {
      continue;
    }
    projectRoots.add(projectRoot);
  }
  for (const projectRoot of projectRoots) {
    // remove CAP services cache
    cache.deleteCAPServices(projectRoot);

    const cachedProject = cache.getProject(projectRoot);
    if (!cachedProject) {
      return;
    }
    if (cachedProject.type !== CAP_PROJECT_TYPE) {
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
      if (!projectInfo) {
        return;
      }
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
  getLogger().debug("`reactOnXmlFileChange` function called", {
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

/**
 * React to an `.view.xml` or `.fragment.xml` file change.
 *
 * @param uri uri to an view file
 * @param changeType change type
 * @description
 * a. for remove operation, it delete view file and controls ids entry
 *
 * b. for create operation, it add view file and controls ids entry
 *
 * c. trigger validator at last to revalidate
 */
export async function reactOnViewFileChange(
  uri: string,
  changeType: FileChangeType,
  validator: () => Promise<void>
): Promise<void> {
  getLogger().debug("`reactOnViewFileChange` function called", {
    xmlUri: uri,
    changeType,
  });

  const documentPath = URI.parse(uri).fsPath;
  if (!isXMLView(documentPath)) {
    return;
  }

  const manifestPath = await findManifestPath(documentPath);
  if (!manifestPath) {
    return;
  }

  if (
    changeType === FileChangeType.Created ||
    changeType === FileChangeType.Deleted
  ) {
    await cache.setViewFile({
      manifestPath,
      documentPath,
      operation: changeType,
    });

    cache.setControlIdsForViewFile({
      manifestPath,
      documentPath,
      operation: changeType,
    });
    await validator();
  }
}
/**
 * React on package.json file. In `package.json` user can define `cds`, `sapux` or similar configurations
 *
 * @param uri uri to a package.json file
 * @param changeType change type
 * @description
 * a. remove CAP services cache
 *
 * b. remove all app cache
 *
 * c. remove project cache
 *
 * @note do not get fresh project / apps as there can be multiple apps and this can lead to performance bottleneck.
 * A fresh project is created and cached once user opens an xml views in respective app.
 */
export const reactOnPackageJson = async (
  uri: string,
  changeType: FileChangeType
): Promise<void> => {
  getLogger().debug("`reactOnPackageJson` function called", {
    packageJsonUri: uri,
    changeType,
  });
  const documentPath = URI.parse(uri).fsPath;
  const projectRoot = await getProjectRoot(documentPath);
  if (!projectRoot) {
    return;
  }
  const cachedProject = cache.getProject(projectRoot);
  if (!cachedProject) {
    return;
  }
  if (cachedProject.type == CAP_PROJECT_TYPE) {
    // remove CAP services cache
    cache.deleteCAPServices(projectRoot);
    for (const [, app] of cachedProject.apps) {
      const appRoot = app.appRoot;
      // remove cached app
      cache.deleteApp(appRoot);
    }
    // remove project cache
    cache.deleteProject(projectRoot);
  }
};

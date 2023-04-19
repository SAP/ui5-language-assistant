import { map } from "lodash";
import { sep } from "path";
import { readFile } from "fs-extra";
import { URI } from "vscode-uri";
import globby from "globby";
import { ManifestDetails } from "./types";
import { Manifest, FileName } from "@sap-ux/project-access";
import findUp from "find-up";
import { findAppRoot, getLogger } from "./utils";
import { cache } from "./cache";
import { unifyServicePath } from "./utils/project";

async function readManifestFile(
  manifestUri: string
): Promise<Manifest | undefined> {
  try {
    const manifestContent = await readFile(
      URI.parse(manifestUri).fsPath,
      "utf-8"
    );
    return JSON.parse(manifestContent);
  } catch (err) {
    getLogger().debug("readManifestFile failed:", err);
    return undefined;
  }
}

export async function initializeManifestData(
  workspaceFolderPath: string
): Promise<void[]> {
  const manifestDocuments = await findAllManifestDocumentsInWorkspace(
    workspaceFolderPath
  );
  const readManifestPromises = map(manifestDocuments, async (manifestDoc) => {
    const response = await readManifestFile(manifestDoc);
    if (response) {
      cache.setManifest(manifestDoc, response);
      getLogger().info("manifest initialized", { manifestDoc });
    }
  });
  getLogger().info("list of manifest.json files", {
    manifestDocuments,
  });
  return Promise.all(readManifestPromises);
}

async function findAllManifestDocumentsInWorkspace(
  workspaceFolderPath: string
): Promise<string[]> {
  return globby(`${workspaceFolderPath}/**/manifest.json`).catch((reason) => {
    getLogger().error(
      `Failed to find all manifest.json files in current workspace!`,
      {
        workspaceFolderPath,
        reason,
      }
    );
    return [];
  });
}

/**
 * Get path of a manifest.json file
 * @param documentPath path to a file e.g. absolute/path/webapp/ext/main/Main.view.xml
 */
export async function findManifestPath(
  documentPath: string
): Promise<string | undefined> {
  return findUp(FileName.Manifest, { cwd: documentPath });
}

/**
 * Get manifest of an app
 * @param manifestRoot absolute root to manifest.json file of an app e.g. /some/other/path/parts/app/manage_travels/webapp/manifest.json
 */
export async function getUI5Manifest(
  manifestRoot: string
): Promise<Manifest | undefined> {
  const cachedManifest = cache.getManifest(manifestRoot);
  if (cachedManifest) {
    return cachedManifest;
  }
  try {
    const data = await readManifestFile(manifestRoot);
    if (data) {
      cache.setManifest(manifestRoot, data);
    }
    return data;
  } catch (error) {
    getLogger().debug("getUI5Manifest->readManifestFile failed:", error);
    return undefined;
  }
}

/**
 * Get main service defined in manifest under `sap.ui5->models`
 * @param manifest manifest of an app
 */
export function getMainService(manifest: Manifest): string | undefined {
  const model = manifest["sap.ovp"]?.globalFilterModel ?? "";
  return manifest["sap.ui5"]?.models?.[model]?.dataSource;
}
/**
 * Get service path defined under `sap.app->dataSources`
 * @param manifest manifest of an app
 * @param serviceName name of data source
 */
export function getServicePath(
  manifest: Manifest,
  serviceName: string
): string | undefined {
  const dataSources = manifest["sap.app"]?.dataSources;

  if (dataSources) {
    const defaultModelDataSource = dataSources[serviceName];

    return defaultModelDataSource?.uri;
  }
  return undefined;
}

function getFlexEnabled(manifest: Manifest): boolean {
  return manifest["sap.ui5"]?.flexEnabled ?? false;
}
function getMinUI5Version(manifest: Manifest): string | undefined {
  return manifest["sap.ui5"]?.dependencies?.minUI5Version;
}

/**
 * Extract details information from manifest
 * @param manifest manifest of an app
 */
async function extractManifestDetails(
  manifest: Manifest
): Promise<ManifestDetails> {
  const customViews = {};
  const targets = manifest["sap.ui5"]?.routing?.targets;
  if (targets) {
    for (const name of Object.keys(targets)) {
      const target = targets[name];
      if (target) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const settings = (target?.options as any)?.settings;
        if (
          (settings?.entitySet || settings?.contextPath) &&
          settings?.viewName
        ) {
          customViews[settings.viewName] = {
            entitySet: settings.entitySet,
            contextPath: settings.contextPath,
          };
        }
        if (
          (settings?.entitySet || settings?.contextPath) &&
          settings?.content
        ) {
          // search for custom section and get its entity set
          const extSettings = settings?.content?.body?.sections ?? {};
          const keys = Object.keys(extSettings);
          for (const key of keys) {
            const template = extSettings[key]?.template;
            if (template) {
              customViews[template] = {
                entitySet: settings?.entitySet,
                contextPath: settings?.contextPath,
              };
            }
          }
        }
      }
    }
  }

  const mainServiceName = getMainService(manifest) ?? "";
  const mainServicePath = unifyServicePath(
    getServicePath(manifest, mainServiceName) ?? "/"
  );
  const flexEnabled = getFlexEnabled(manifest);
  const minUI5Version = getMinUI5Version(manifest);
  return {
    mainServicePath,
    customViews,
    flexEnabled,
    minUI5Version,
  };
}

/**
 * Get details of manifest defined under `webapp`
 * @param documentPath path to a file e.g. absolute/path/webapp/ext/main/Main.view.xml
 */
export async function getManifestDetails(
  documentPath: string
): Promise<ManifestDetails> {
  const manifestPath = await findManifestPath(documentPath);
  if (!manifestPath) {
    return {
      flexEnabled: false,
      customViews: {},
      mainServicePath: undefined,
      minUI5Version: undefined,
    };
  }
  const manifest = await getUI5Manifest(manifestPath);
  if (!manifest) {
    return {
      flexEnabled: false,
      customViews: {},
      mainServicePath: undefined,
      minUI5Version: undefined,
    };
  }
  return extractManifestDetails(manifest);
}

/**
 * Get custom view id
 *
 * Id of a `.view.xml` or `.fragment.xml` is calculated based on manifest app id and relative file from app root folder
 */
export const getCustomViewId = async (
  documentPath: string
): Promise<string> => {
  const appRoot = await findAppRoot(documentPath);
  if (!appRoot) {
    return "";
  }
  const manifestPath = await findManifestPath(documentPath);
  if (!manifestPath) {
    return "";
  }
  const manifest = await getUI5Manifest(manifestPath);
  const appId = manifest?.["sap.app"]?.id ?? "";
  const relativeFilePart = documentPath.split(appRoot)[1];
  if (!relativeFilePart) {
    return "";
  }
  const relativeFileWithoutExt = relativeFilePart.replace(
    /\.(view|fragment)\.xml$/,
    ""
  );
  const relativeFileId = relativeFileWithoutExt
    .split(sep)
    .filter((item) => item)
    .join(".");
  return `${appId}.${relativeFileId}`;
};

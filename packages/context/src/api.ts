import { getMinimumUI5Version } from "@sap-ux/project-access";
import {
  getCustomViewId,
  getManifestDetails,
  getUI5Manifest,
} from "./manifest";
import { finAdpdManifestPath } from "./adp-manifest";
import { getServices } from "./services";
import {
  Context,
  ManifestVersionChange,
  UI5_VERSION_S4_PLACEHOLDER,
} from "./types";
import { getSemanticModel } from "./ui5-model";
import { getYamlDetails } from "./ui5-yaml";
import { getViewFiles } from "./utils/view-files";
import { getControlIds } from "./utils/control-ids";
import { getLogger } from "./utils";
import { cache } from "./cache";
import { readFile } from "fs/promises";
import { FileChangeType } from "vscode-languageserver/node";
import { URI } from "vscode-uri";

export {
  initializeManifestData,
  getManifestDetails,
  getUI5Manifest,
  findManifestPath,
} from "./manifest";
export {
  initializeUI5YamlData,
  getYamlDetails,
  getUI5Yaml,
  findYamlPath,
} from "./ui5-yaml";
export { cache } from "./cache";
export {
  reactOnCdsFileChange,
  reactOnUI5YamlChange,
  reactOnManifestChange,
  reactOnXmlFileChange,
  reactOnViewFileChange,
  reactOnPackageJson,
} from "./watcher";

/**
 * Get context for a file
 * @param documentPath path to a file e.g. absolute/path/webapp/ext/main/Main.view.xml
 * @param modelCachePath path to a cached UI5 model
 * @param content document content. If provided, it will re-parse and re-assign it to current document of xml views
 */
export async function getContext(
  documentPath: string,
  modelCachePath?: string,
  content?: string
): Promise<Context | Error> {
  try {
    const manifestDetails = await getManifestDetails(documentPath);
    let manifestPath = manifestDetails.manifestPath;
    const manifest = await getUI5Manifest(manifestPath);
    let minUI5Version = manifestDetails.minUI5Version;
    // if minUi5Version is not S4 placeholder, get it from manifest
    if (minUI5Version !== UI5_VERSION_S4_PLACEHOLDER && manifest) {
      minUI5Version = getMinimumUI5Version(manifest);
    }

    const yamlDetails = await getYamlDetails(documentPath);
    const ui5Model = await getSemanticModel(
      modelCachePath,
      yamlDetails.framework,
      minUI5Version
    );
    const services = await getServices(documentPath);
    const customViewId = await getCustomViewId(documentPath);
    if (!manifestPath) {
      const adpManifestPath = await finAdpdManifestPath(documentPath);
      if (adpManifestPath) {
        manifestPath = adpManifestPath;
      }
    }
    const viewFiles = await getViewFiles({
      manifestPath,
      documentPath,
      content,
    });
    const controlIds = getControlIds({
      manifestPath,
      documentPath,
      content,
    });
    return {
      manifestDetails,
      yamlDetails,
      ui5Model,
      services,
      customViewId,
      viewFiles,
      controlIds,
      documentPath,
    };
  } catch (error) {
    getLogger().debug("getContext failed:", {
      error,
    });
    return error as Error;
  }
}

/**
 * Checks if data is context or an error
 */
export const isContext = (
  data: Context | (Error & { code?: string })
): data is Context => {
  if ((data as Context).ui5Model) {
    return true;
  }
  return false;
};

export const DEFAULT_I18N_NAMESPACE = "translation";

/**
 * Retrieves and compares manifest versions to detect changes.
 *
 * Reads the manifest file from the specified URI, compares the cached version
 * with the current version in the file, and returns information about any version changes.
 *
 * @param {Object} params - The parameters object
 * @param {FileChangeType} params.changeType - The type of file change (Created, Changed, or Deleted)
 * @param {string} params.manifestUri - The URI of the manifest.json file
 * @returns {Promise<ManifestVersionChange>} An object containing the old version, new version,
 *                                           and a boolean indicating whether the version changed
 * @throws {Error} Returns a default result object with empty versions if reading or parsing fails
 */
export async function getManifestVersion({
  manifestUri,
  changeType,
}: {
  changeType: FileChangeType;
  manifestUri: string;
}): Promise<ManifestVersionChange> {
  if (changeType === FileChangeType.Deleted) {
    return { oldVersion: "", newVersion: "", changed: false };
  }
  try {
    const manifestPath = URI.parse(manifestUri).fsPath;
    const oldManifest = cache.getManifest(manifestPath);
    const manifestContent = await readFile(manifestPath, "utf-8");
    const newManifest = JSON.parse(manifestContent);
    const oldVersion = oldManifest["_version"];
    const newVersion = newManifest["_version"];
    return { oldVersion, newVersion, changed: oldVersion !== newVersion };
  } catch (error) {
    getLogger().debug("getManifestVersion failed:", {
      error,
    });
  }
  return { oldVersion: "", newVersion: "", changed: false };
}

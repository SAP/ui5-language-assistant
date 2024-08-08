import { getMinimumUI5Version } from "@sap-ux/project-access";
import {
  getCustomViewId,
  getManifestDetails,
  getUI5Manifest,
} from "./manifest";
import { getServices } from "./services";
import { Context } from "./types";
import { getSemanticModel } from "./ui5-model";
import { getYamlDetails } from "./ui5-yaml";
import { getViewFiles } from "./utils/view-files";
import { join } from "path";

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
export { getCDNBaseUrl } from "./utils";
export { cache } from "./cache";
export {
  reactOnCdsFileChange,
  reactOnUI5YamlChange,
  reactOnManifestChange,
  reactOnXmlFileChange,
  reactOnPackageJson,
} from "./watcher";

/**
 * Get context for a file
 * @param documentPath path to a file e.g. absolute/path/webapp/ext/main/Main.view.xml
 * @param modelCachePath path to a cached UI5 model
 */
export async function getContext(
  documentPath: string,
  modelCachePath?: string
): Promise<Context | Error> {
  try {
    const manifestDetails = await getManifestDetails(documentPath);
    const manifest = await getUI5Manifest(manifestDetails.manifestPath);
    let minUI5Version = manifestDetails.minUI5Version;
    if (manifest) {
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
    const viewFiles = await getViewFiles(
      join(manifestDetails.manifestPath, "..")
    );
    return {
      manifestDetails,
      yamlDetails,
      ui5Model,
      services,
      customViewId,
      viewFiles,
      documentPath,
    };
  } catch (error) {
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

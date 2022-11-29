import { getCustomViewId, getManifestDetails } from "./manifest";
import { getServices } from "./services";
import { Context } from "./types";
import { getSemanticModel } from "./ui5-model";
import { getYamlDetails } from "./ui5-yaml";

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
 * @param modelCachePath path to a cached ui5 model
 */
export async function getContext(
  documentPath: string,
  modelCachePath?: string
): Promise<Context> {
  const manifestDetails = await getManifestDetails(documentPath);
  const yamlDetails = await getYamlDetails(documentPath);
  const ui5Model = await getSemanticModel(
    modelCachePath,
    yamlDetails.framework,
    manifestDetails.minUI5Version
  );
  const services = await getServices(documentPath);
  const customViewId = await getCustomViewId(documentPath);
  return { manifestDetails, yamlDetails, ui5Model, services, customViewId };
}

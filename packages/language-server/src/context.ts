import type {
  AppContext,
  UI5SemanticModel,
} from "@ui5-language-assistant/semantic-model-types";
import { cache } from "./cache";
import { getMinUI5VersionForXMLFile } from "./manifest-handling";
import { getManifestPath } from "./path";
import { getSemanticModel } from "./ui5-model";
import { getUI5FrameworkForXMLFile } from "./ui5yaml-handling";

export const getUI5Model = async (
  documentPath: string,
  modelCachePath?: string
): Promise<UI5SemanticModel> => {
  const minUI5Version = getMinUI5VersionForXMLFile(documentPath);
  const framework = getUI5FrameworkForXMLFile(documentPath);
  const model = await getSemanticModel(
    modelCachePath,
    framework,
    minUI5Version
  );
  return model;
};

export async function getContextForFile(
  documentPath: string,
  modelCachePath?: string
): Promise<AppContext> {
  const ui5Model = await getUI5Model(documentPath, modelCachePath);
  const context: AppContext = {
    ui5Model,
    manifest: cache.getManifestDetails(getManifestPath(documentPath)),
  };
  return context;
}

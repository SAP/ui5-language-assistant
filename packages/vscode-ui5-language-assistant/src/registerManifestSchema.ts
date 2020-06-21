/* istanbul ignore file - temporary workaround */
import { isArray, find, some, clone } from "lodash";
import { workspace } from "vscode";
import {
  getManifestSchemaConfig,
  IJSONValidationExtensionPoint,
} from "./manifestSchemaConfig";

/**
 *  The configuration will be written in workspace.settings
 */
export function registerManifestSchema(): void {
  const jsonSchemaConfig:
    | IJSONValidationExtensionPoint
    | undefined = workspace.getConfiguration().get("json.schemas");
  if (isArray(jsonSchemaConfig)) {
    const hasManifestJsonConfig =
      find(
        jsonSchemaConfig,
        (jsonSchemaConfigEntry: IJSONValidationExtensionPoint) => {
          if (isArray(jsonSchemaConfigEntry.fileMatch)) {
            return some(
              jsonSchemaConfigEntry.fileMatch,
              (fileMatchEntry) => fileMatchEntry === "manifest.json"
            );
          }

          return jsonSchemaConfigEntry.fileMatch === "manifest.json";
        }
      ) !== undefined;

    if (!hasManifestJsonConfig) {
      const manifestSchemaConfig = getManifestSchemaConfig();

      const updatedSchemaConfig = clone(jsonSchemaConfig);
      updatedSchemaConfig.push(manifestSchemaConfig);
      // We pass 'undefined' for multi-root
      //  - https://code.visualstudio.com/api/references/vscode-api#WorkspaceConfiguration
      workspace
        .getConfiguration()
        .update("json.schemas", updatedSchemaConfig, undefined);
    }
  }
}

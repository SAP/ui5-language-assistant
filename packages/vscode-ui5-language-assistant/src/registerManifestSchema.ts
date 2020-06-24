/* istanbul ignore file - temporary workaround */
import { isArray, find, some, clone, findIndex } from "lodash";
import { workspace } from "vscode";
import {
  getManifestSchemaConfigEntry,
  IJSONValidationExtensionPoint,
  MANIFEST_COMMENT,
  MANIFEST_FILE_MATCH,
} from "./manifestSchemaConfig";

/**
 *  The configuration will be written in workspace.settings
 */
export function registerManifestSchema(): void {
  const jsonSchemaConfig:
    | IJSONValidationExtensionPoint
    | undefined = workspace.getConfiguration().get("json.schemas");
  if (isArray(jsonSchemaConfig)) {
    const previousConfigEntryIndex = getIndexOfPreviousConfigEntry(
      jsonSchemaConfig
    );
    if (previousConfigEntryIndex !== -1) {
      updatePreviousConfigEntry(jsonSchemaConfig, previousConfigEntryIndex);
    } else if (isMissingConfig(jsonSchemaConfig)) {
      createConfig(jsonSchemaConfig);
    } else {
      // No change is needed
    }
  }
}

function isMissingConfig(
  jsonSchemaConfig: IJSONValidationExtensionPoint[]
): boolean {
  const isMissingConfigEntry =
    find(
      jsonSchemaConfig,
      (jsonSchemaConfigEntry: IJSONValidationExtensionPoint) => {
        return some(
          jsonSchemaConfigEntry.fileMatch,
          (fileMatchEntry) => fileMatchEntry === MANIFEST_FILE_MATCH
        );
      }
    ) === undefined;

  return isMissingConfigEntry;
}

function createConfig(jsonSchemaConfig: IJSONValidationExtensionPoint[]): void {
  const configEntry = getManifestSchemaConfigEntry();
  const updatedSchemaConfig = clone(jsonSchemaConfig);
  updatedSchemaConfig.push(configEntry);

  configureSchemaInWorkspaceSettings(updatedSchemaConfig);
}

function getIndexOfPreviousConfigEntry(
  jsonSchemaConfig: IJSONValidationExtensionPoint[]
): number {
  const previousConfigEntryIndex = findIndex(
    jsonSchemaConfig,
    (jsonSchemaConfigEntry: IJSONValidationExtensionPoint) => {
      if (jsonSchemaConfigEntry.fileMatch.length === 1) {
        // we are looking for exact match to be sure we are only changing 'settings.json' we added
        return some(
          jsonSchemaConfigEntry.fileMatch,
          (fileMatchEntry) =>
            fileMatchEntry === MANIFEST_FILE_MATCH &&
            jsonSchemaConfigEntry.comment === MANIFEST_COMMENT
        );
      }

      return false;
    }
  );

  return previousConfigEntryIndex;
}

function updatePreviousConfigEntry(
  jsonSchemaConfig: IJSONValidationExtensionPoint[],
  previusConfigEntryIndex: number
): void {
  const updatedSchemaConfig = clone(jsonSchemaConfig);
  updatedSchemaConfig[previusConfigEntryIndex] = getManifestSchemaConfigEntry();

  configureSchemaInWorkspaceSettings(updatedSchemaConfig);
}

function configureSchemaInWorkspaceSettings(
  updatedSchemaConfig: IJSONValidationExtensionPoint[]
): void {
  // We pass 'true' for global settings
  //  - https://code.visualstudio.com/api/references/vscode-api#WorkspaceConfiguration
  workspace
    .getConfiguration()
    .update("json.schemas", updatedSchemaConfig, true);
}

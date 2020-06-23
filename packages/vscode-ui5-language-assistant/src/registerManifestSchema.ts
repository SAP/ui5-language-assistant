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
  const missingConfigEntry =
    find(
      jsonSchemaConfig,
      (jsonSchemaConfigEntry: IJSONValidationExtensionPoint) => {
        if (isArray(jsonSchemaConfigEntry.fileMatch)) {
          return some(
            jsonSchemaConfigEntry.fileMatch,
            (fileMatchEntry) => fileMatchEntry === MANIFEST_FILE_MATCH
          );
        }

        return jsonSchemaConfigEntry.fileMatch === MANIFEST_FILE_MATCH;
      }
    ) === undefined;

  return missingConfigEntry;
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
      return (
        jsonSchemaConfigEntry.fileMatch === MANIFEST_FILE_MATCH &&
        jsonSchemaConfigEntry.comment === MANIFEST_COMMENT
      );
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
  // We pass 'undefined' for multi-root
  //  - https://code.visualstudio.com/api/references/vscode-api#WorkspaceConfiguration
  workspace
    .getConfiguration()
    .update("json.schemas", updatedSchemaConfig, undefined);
}

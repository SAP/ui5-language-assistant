export interface IJSONValidationExtensionPoint {
  fileMatch: string | string[];
  comment?: string;
  url: string;
}

export const MANIFEST_FILE_MATCH = "manifest.json";
export const MANIFEST_COMMENT =
  "Automatic configuration for manifest.json schema - added by UI5 Language Assistant";

export function getManifestSchemaConfigEntry(): IJSONValidationExtensionPoint {
  const manifestSchemaConfig = {
    fileMatch: MANIFEST_FILE_MATCH,
    comment: MANIFEST_COMMENT,
    url:
      "https://cdn.jsdelivr.net/gh/SAP/ui5-language-assistant/packages/vscode-ui5-language-assistant/resources/manifest-schema/rel-1.19/schema/schema.json",
  };

  return manifestSchemaConfig;
}

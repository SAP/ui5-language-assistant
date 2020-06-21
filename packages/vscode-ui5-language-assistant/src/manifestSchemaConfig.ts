export interface IJSONValidationExtensionPoint {
  fileMatch: string | string[];
  comment?: string;
  url: string;
}

export function getManifestSchemaConfig(): IJSONValidationExtensionPoint {
  const manifestSchemaConfig = {
    fileMatch: ["manifest.json"],
    comment:
      "Automatic configuration for manifest.json schema - added by UI5 Language Assistant",
    url:
      "https://cdn.jsdelivr.net/gh/SAP/ui5-language-assistant/packages/vscode-ui5-language-assistant/resources/manifest-schema/rel-1.19/schema/schema.json",
  };

  return manifestSchemaConfig;
}

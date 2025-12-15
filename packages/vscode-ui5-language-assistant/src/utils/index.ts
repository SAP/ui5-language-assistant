import { join } from "path";
import { readdir, readFile } from "fs/promises";
import { ExtensionContext } from "vscode";
import { getLogger } from "../logger";

const getDummySchema = (files: string[]) => {
  const regex = /schema-v(\d+\.\d+\.\d+)\.json/;
  const versions = files
    .map((file) => {
      const match = regex.exec(file);
      return match ? match[1] : null;
    })
    .filter((v): v is string => v !== null);
  const supportedVersions = versions
    .map((v) => {
      const major = v.split(".")[0];
      return `${major} (e.g., ${v})`;
    })
    .join(", ");
  const content = `
{
  "title": "SAP JSON schema for Web Application Manifest File - Invalid Version",
  "$schema": "http://json-schema.org/draft-07/schema",
  "type": "object",
  "required": ["_version"],
  "additionalProperties": false,
  "properties": {
    "$schema": {
      "description": "The resource identifier for the JSON schema to be used.",
      "type": "string"
    },
    "_version": {
      "description": "ERROR: Wrong major version specified in the manifest file. Supported major versions are: ${supportedVersions}. Please update your _version field.",
      "type": "string",
      "not": {
        "type": "string"
      },
      "errorMessage": ""
    }
  }
}

`;
  return content;
};

/**
 * Read schema content from `lib->manifest->schema.json`
 *
 */
export const getSchemaContent = async (
  context: ExtensionContext,
  schemaVersion: string
): Promise<string> => {
  let filePath = "";
  try {
    const BASE_PATH = context.asAbsolutePath(join("lib", "src", "manifest"));
    const files = await readdir(BASE_PATH);
    const majorVersion = schemaVersion.split(".")[0];
    const fileName = files.find((file) =>
      file.startsWith(`schema-v${majorVersion}`)
    );
    if (!fileName) {
      getLogger().error(
        `No local manifest schema file found for major version ${majorVersion}`
      );
      return getDummySchema(files);
    }
    filePath = join(BASE_PATH, fileName);
    const content = await readFile(filePath, "utf8");
    return content;
  } catch (error) {
    getLogger().error(
      `Failed to read manifest content from ${filePath}`,
      error
    );
    return "";
  }
};

export {
  getSemanticTokens,
  tokenTypesLegend,
  CustomSemanticToken,
  getTokenType,
} from "./binding-semantic-token-creator";

export function getSchemaUri(version: string): string {
  return `https://raw.githubusercontent.com/UI5/manifest/refs/tags/v${version}/schema.json`;
}

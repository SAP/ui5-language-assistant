import { join } from "path";
import { readFile } from "fs/promises";
import { ExtensionContext } from "vscode";
import { getLogger } from "../logger";

/**
 * Read schema content from `lib->manifest->schema.json`
 *
 */
export const getSchemaContent = async (
  context: ExtensionContext,
  schemaVersion: string
): Promise<string> => {
  let fileName = "schema-v1.json";
  // for version 2.x use v2 schema
  if (schemaVersion.startsWith("2.")) {
    fileName = "schema-v2.json";
  }
  const filePath = context.asAbsolutePath(
    join("lib", "src", "manifest", fileName)
  );
  try {
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

export function replaceVersionPlaceholder(
  uriTemplate: string,
  version: string
): string {
  return uriTemplate.replace("{VERSION_PLACEHOLDER}", version);
}

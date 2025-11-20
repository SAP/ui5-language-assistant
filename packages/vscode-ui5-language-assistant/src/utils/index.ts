import { join } from "path";
import { readdir, readFile } from "fs/promises";
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
      return "";
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

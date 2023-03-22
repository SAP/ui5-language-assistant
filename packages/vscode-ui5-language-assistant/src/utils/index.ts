import { join } from "path";
import { readFile } from "fs/promises";
import { ExtensionContext } from "vscode";

/**
 * Read schema content from `lib->manifest->schema.json`
 *
 */
export const getSchemaContent = (
  context: ExtensionContext
): Promise<string> => {
  const filePath = context.asAbsolutePath(
    join("lib", "src", "manifest", "schema.json")
  );
  return readFile(filePath, "utf8");
};

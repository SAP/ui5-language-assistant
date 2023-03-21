import { join } from "path";
import { readFileSync } from "fs";
import { ExtensionContext } from "vscode";

/**
 * Read schema content from `lib->manifest->schema.json`
 *
 */
export const getSchemaContent = (context: ExtensionContext): string => {
  const filePath = context.asAbsolutePath(
    join("lib", "src", "manifest", "schema.json")
  );
  return readFileSync(filePath, "utf8");
};

import { access, constants } from "fs";
import { join, dirname } from "path";

/**
 * Check if path exists on file system.
 *
 * @param filePath absolute path to a file on file system.
 * @returns boolean
 */
export async function pathExists(filePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    access(filePath, constants.F_OK, (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

/**
 * Build absolute file uri based on manifest path and value without namespace.
 * Following extension are checked:
 * - `.controller.js`
 * - `.controller.ts`
 *
 * @param namespace app id or app namespace
 * @param value value with namespace
 * @param manifestPath path to manifest
 * @returns file uri or undefined
 */
export async function buildFileUri(
  namespace: string,
  value: string,
  manifestPath: string
): Promise<string | undefined> {
  /* istanbul ignore next */
  const parts = value.split(namespace) ?? [];
  const valueWithoutNS = parts.filter((i) => !!i).join(".");
  /* istanbul ignore next */
  const withoutNSParts = valueWithoutNS.split(".") ?? [];
  const absolutePath = join(dirname(manifestPath), ...withoutNSParts);

  for (const ext of ["js", "ts"]) {
    const filePath = `${absolutePath}.controller.${ext}`;
    if (await pathExists(filePath)) {
      return filePath;
    }
    const filePathWithoutCtr = `${absolutePath}.${ext}`;
    if (await pathExists(filePathWithoutCtr)) {
      return filePathWithoutCtr;
    }
  }
  return;
}

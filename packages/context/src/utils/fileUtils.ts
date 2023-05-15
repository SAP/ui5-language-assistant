import { readFileSync } from "fs";
import { dirname, join, sep, posix } from "path";
import globby from "globby";
import { getLogger } from ".";

/**
 * Synchronously checks whether the file exists
 *
 * @param path
 * @returns boolean result
 */
export function fileExists(path: string): boolean {
  try {
    readFileSync(path, { flag: "r" });
    return true;
  } catch (e) {
    return false;
  }
}

export function toPosixPath(path: string): string {
  return path.split(sep).join(posix.sep);
}

export function toPlatformSpecificPath(path: string): string {
  return path.split(posix.sep).join(sep);
}

/**
 * Looks up for files in the given workspace by given file name
 * @param workspaceFolderPath
 * @param fileName
 * @returns found pathes to files
 */
export async function findAllFilesInWorkspace(
  workspaceFolderPath: string,
  fileName: string
): Promise<string[]> {
  // Windows paths are not supported by globby
  const pattern = toPosixPath(join(workspaceFolderPath, "**", fileName));
  const result = globby(pattern).catch((reason) => {
    getLogger().error(
      `Failed to find all ${fileName} files in current workspace!`,
      {
        workspaceFolderPath,
        reason,
      }
    );
    return [];
  });
  return (await result).map((path) => toPlatformSpecificPath(path));
}

import { join } from "path";
import { DirName, FileName } from "./types";

/**
 * Returns the path of the corresponding manifest.json file for a given file path
 *
 * @param documentPath  Path of a document file in current project (i.e. c:/Users/someUser/project/webapp/ext/main/Main.view.xml)
 * @returns         Path to manifest (i.e. c:/Users/someUser/project/webapp/manifest.json)
 * @note it relays on the fact that `webapp` exits in path. If `webapp` does not exit, webapp/manifest.json is returned as a result
 */

export const getManifestPath = (documentPath: string): string => {
  const pathSegments = documentPath.split(DirName.Webapp);
  pathSegments.pop();
  const manifestPath = join(...pathSegments, DirName.Webapp, FileName.Manifest);
  return manifestPath;
};

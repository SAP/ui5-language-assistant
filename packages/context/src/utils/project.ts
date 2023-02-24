import {
  findProjectRoot,
  isCapJavaProject,
  isCapNodeJsProject,
  getAppRootFromWebappPath,
  FileName,
  Manifest,
  Package,
} from "@sap-ux/project-access";

import { readFile } from "fs/promises";
import { join } from "path";
import findUp from "find-up";
import {
  CAP_PROJECT_TYPE,
  ProjectKind,
  ProjectType,
  UI5_PROJECT_TYPE,
} from "../types";
import { getLogger } from "./logger";

/**
 * Unify service path by adding forward slash to beginning and end of a service path
 *
 * @param servicePath path to a service
 */
export const unifyServicePath = (servicePath: string): string => {
  const key = servicePath
    .split(/\\|\//)
    .filter((item) => item)
    .join("/");
  return `/${key}/`;
};

/**
 * Get project root
 *
 * @param documentPath path to a file e.g. absolute/path/webapp/ext/main/Main.view.xml
 */
export async function getProjectRoot(
  documentPath: string
): Promise<string | undefined> {
  let projectRoot = await findProjectRoot(documentPath, true, true);

  if (projectRoot === "") {
    projectRoot = await findProjectRoot(documentPath, false, true);
  }
  if (projectRoot === "") {
    getLogger().debug("getProjectRoot failed for path: ", documentPath);
    return undefined;
  }
  return projectRoot;
}
/**
 * Get project type and kind information
 *
 * @param projectRoot path to project root
 */
export async function getProjectInfo(
  projectRoot: string
): Promise<{ type: ProjectType; kind: ProjectKind } | undefined> {
  try {
    const jsonContent = await readFile(
      join(projectRoot, FileName.Package),
      "utf-8"
    );
    const packageJSON = JSON.parse(jsonContent) as Package;

    if (await isCapNodeJsProject(packageJSON)) {
      return {
        type: CAP_PROJECT_TYPE,
        kind: "NodeJS",
      };
    }
    if (await isCapJavaProject(projectRoot)) {
      return {
        type: CAP_PROJECT_TYPE,
        kind: "Java",
      };
    }

    return {
      type: UI5_PROJECT_TYPE,
      kind: "UI5",
    };
  } catch (error) {
    getLogger().debug("getProjectInfo failed:", error);
    return undefined;
  }
}
/**
 * Get app root based on path being current working directory
 *
 * @param path a file path
 */
export async function findAppRoot(path: string): Promise<string | undefined> {
  const manifestJson = await findUp(FileName.Manifest, { cwd: path });
  if (manifestJson) {
    const appRoot = await getAppRootFromWebappPath(manifestJson);
    return appRoot ?? undefined;
  }
  return undefined;
}
/**
 * Get local annotation files defined for a service
 *
 * @param manifest manifest of an app
 * @param serviceName name of data source
 * @param appRoot path to root of an app
 */
export async function getLocalAnnotationsForService(
  manifest: Manifest,
  serviceName: string,
  appRoot: string
): Promise<string[]> {
  const dataSources = manifest["sap.app"]?.dataSources;
  if (dataSources && serviceName !== undefined) {
    const dataSource = dataSources[serviceName];
    const annotationFilePaths = (dataSource?.settings?.annotations ?? [])
      .map((name) => dataSources[name]?.settings?.localUri)
      .filter((path): path is string => !!path);
    if (annotationFilePaths.length) {
      try {
        return await Promise.all(
          annotationFilePaths.map((path) =>
            readFile(join(appRoot, path), {
              encoding: "utf8",
            })
          )
        );
      } catch (error) {
        getLogger().debug("getLocalAnnotationsForService failed:", error);
        return [];
      }
    }
  }
  return [];
}
/**
 * Get local metadata file defined for a service
 *
 * @param manifest manifest of an app
 * @param serviceName name of data source
 * @param appRoot path to root of an app
 */
export async function getLocalMetadataForService(
  manifest: Manifest,
  serviceName: string,
  appRoot: string
): Promise<string | undefined> {
  const dataSources = manifest["sap.app"]?.dataSources;

  if (dataSources && serviceName !== undefined) {
    const defaultModelDataSource = dataSources[serviceName];

    const localUri = defaultModelDataSource?.settings?.localUri;
    if (localUri) {
      try {
        const metadataPath = join(appRoot, localUri);
        return await readFile(metadataPath, {
          encoding: "utf8",
        });
      } catch (error) {
        getLogger().debug("getLocalMetadataForService failed:", error);
        return undefined;
      }
    }
  }
  return undefined;
}

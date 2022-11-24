import {
  App,
  CAPProject,
  CAP_PROJECT_TYPE,
  ManifestDetails,
  Project,
  ProjectKind,
  ProjectType,
  ServiceDetails,
  UI5Project,
  UI5_PROJECT_TYPE,
} from "./types";
import {
  findAppRoot,
  getLocalAnnotationsForService,
  getLocalMetadataForService,
  getProjectInfo,
  getProjectRoot,
} from "./utils";
import {
  getCapModelAndServices,
  loadModuleFromProject,
  Manifest,
} from "@sap-ux/project-access";
import {
  getMainService,
  getManifestDetails,
  getServicePath,
  getUI5Manifest,
  findManifestPath,
} from "./manifest";
import { parseServiceFiles } from "./parser";
import { cache } from "./cache";
import { sep } from "path";
import { getLogger } from "@ui5-language-assistant/logic-utils";

/**
 * Get CAP project
 *
 * @param projectRoot path to root of a project
 * @param appRoot path to root of an app
 * @param manifest path to manifest defined in under app root
 * @param manifestDetails details of manifest
 * @param projectInfo information about project type and kind
 */
export async function getCAPProject(
  projectRoot: string,
  projectInfo: { type: ProjectType; kind: ProjectKind },
  appRoot: string,
  manifest: Manifest,
  manifestDetails: ManifestDetails
): Promise<CAPProject | undefined> {
  if (projectInfo.kind === "Java") {
    getLogger().info("Java project is not supported yet.");
    return;
  }
  const app = await getApp(
    projectRoot,
    appRoot,
    manifest,
    manifestDetails,
    projectInfo
  );
  if (!app) {
    return;
  }
  return {
    type: CAP_PROJECT_TYPE,
    kind: "NodeJS",
    root: projectRoot,
    apps: new Map([[appRoot, app]]),
  };
}
/**
 * Get UI5 project
 *
 * @param projectRoot path to root of a project
 * @param appRoot path to root of an app
 * @param manifest path to manifest defined in under app root
 * @param manifestDetails details of manifest
 */
export async function getUI5Project(
  projectRoot: string,
  appRoot: string,
  manifest: Manifest,
  manifestDetails: ManifestDetails
): Promise<UI5Project | undefined> {
  const app = await getApp(projectRoot, appRoot, manifest, manifestDetails, {
    kind: "UI5",
    type: "UI5",
  });
  if (!app) {
    return;
  }
  return {
    type: UI5_PROJECT_TYPE,
    root: projectRoot,
    app,
  };
}

/**
 * Get CAP or UI5 project
 *
 * @param documentPath path to a file i.e absolute/path/webapp/ext/main/Main.view.xml
 */
export async function getProject(
  documentPath: string
): Promise<Project | undefined> {
  const projectRoot = await getProjectRoot(documentPath);
  if (!projectRoot) {
    return;
  }
  const cachedProject = cache.getProject(projectRoot);
  if (cachedProject) {
    return cachedProject;
  }
  const appRoot = await findAppRoot(documentPath);
  if (!appRoot) {
    return;
  }
  const manifestPath = await findManifestPath(documentPath);
  if (!manifestPath) {
    return;
  }
  const manifest = await getUI5Manifest(manifestPath);
  if (!manifest) {
    return;
  }
  const manifestDetails = await getManifestDetails(documentPath);
  const projectInfo = await getProjectInfo(projectRoot);
  if (!projectInfo) {
    return;
  }
  if (projectInfo.type === CAP_PROJECT_TYPE) {
    const capProject = await getCAPProject(
      projectRoot,
      projectInfo,
      appRoot,
      manifest,
      manifestDetails
    );
    if (capProject) {
      cache.setProject(projectRoot, capProject);
    }
    return capProject;
  }
  const ui5Project = await getUI5Project(
    projectRoot,
    appRoot,
    manifest,
    manifestDetails
  );
  if (ui5Project) {
    cache.setProject(projectRoot, ui5Project);
  }
  return ui5Project;
}

const trimSeparator = (path: string): string => {
  return path
    .split(sep)
    .filter((item) => item)
    .join(sep);
};
/**
 * Get cap services
 *
 * @param projectRoot path to root of a project
 */
async function getCapServices(
  projectRoot: string
): Promise<Map<string, string>> {
  const cachedCapServices = cache.getCapServices(projectRoot);
  if (cachedCapServices) {
    return cachedCapServices;
  }
  const services = new Map<string, string>();
  try {
    const data = await getCapModelAndServices(projectRoot);
    const cds = await loadModuleFromProject<any>(projectRoot, "@sap/cds");
    for (const service of data.services) {
      const metadataContent = cds.compile.to.edmx(data.model, {
        version: "v4",
        service: service.name,
        odataForeignKeys: true,
        odataContainment: false,
      });

      services.set(trimSeparator(service.urlPath), metadataContent);
    }
  } catch (error) {
    getLogger().debug("getCapServices failed:", error);
    return new Map();
  }
  cache.setCapServices(projectRoot, services);
  return services;
}

/**
 * Get an app for CAP or UI5 project
 *
 * @param projectRoot path to root of a project
 * @param appRoot path to root of an app
 * @param manifest path to manifest defined in under app root
 * @param manifestDetails details of manifest
 * @param projectInfo information about project type and kind
 */
export async function getApp(
  projectRoot: string,
  appRoot: string,
  manifest: Manifest,
  manifestDetails: ManifestDetails,
  projectInfo: { type: ProjectType; kind: ProjectKind }
): Promise<App | undefined> {
  const cachedApp = cache.getApp(appRoot);
  if (cachedApp) {
    return cachedApp;
  }
  const mainServiceName = getMainService(manifest);
  if (mainServiceName === undefined) {
    return;
  }
  const annotationFiles = await getLocalAnnotationsForService(
    manifest,
    mainServiceName,
    appRoot
  );
  const path = trimSeparator(getServicePath(manifest, mainServiceName) ?? "/");
  let metadataContent;
  if (projectInfo.type === "CAP") {
    const services = await getCapServices(projectRoot);
    metadataContent = services.get(path);
  } else {
    metadataContent = await getLocalMetadataForService(
      manifest,
      mainServiceName,
      appRoot
    );
  }
  const localService = parseServiceFiles({
    annotationFiles,
    path,
    metadataContent,
  });

  if (!localService) {
    return;
  }
  const app = {
    appRoot,
    projectRoot,
    manifest,
    manifestDetails,
    localServices: new Map<string, ServiceDetails>([[path, localService]]),
  };
  cache.setApp(appRoot, app);
  return app;
}

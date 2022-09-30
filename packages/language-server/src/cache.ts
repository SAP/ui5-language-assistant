import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { sep, normalize, join } from "path";

import { Fetcher } from "api";
import fetch from "node-fetch";
import {
  AppContext,
  ManifestDetails,
  ServiceDetails,
  UI5Framework,
  UI5SemanticModel,
} from "@ui5-language-assistant/semantic-model-types";

import { getMinUI5VersionForXMLFile } from "./manifest-handling";
import { createSemanticModelWithFetcher } from "./ui5-model";

import {
  getCapModelAndServices,
  loadModuleFromProject,
} from "@sap-ux/project-access";

import { parse, merge } from "@sap-ux/edmx-parser";
import { convert } from "@sap-ux/annotation-converter";
import type { Manifest } from "@sap-ux/project-types";
import { getUI5FrameworkForXMLFile } from "./ui5yaml-handling";
import {
  isCapJavaProject,
  isCapNodeJsProject,
} from "@sap-ux/project-access/dist/project/cap";

import {
  findProjectRoot,
  getAppRootFromWebappPath,
} from "@sap-ux/project-access/dist/project/findApps";

import { FileName } from "@sap-ux/project-types";
import { Configuration, UI5Config } from "@sap-ux/ui5-config";
import findUp from "find-up";

const CAP_PROJECT_TYPE = "CAP";
interface CAPProject {
  type: typeof CAP_PROJECT_TYPE;
  kind: CAPProjectKind;
  root: string;
  ui5Config?: UI5Config;
  /**
   * Mapping from service path to service metadata
   */
  services: Map<string, string>;
  apps: Map<string, CachedApp>;
}

const UI5_PROJECT_TYPE = "UI5";

interface UI5Project {
  type: typeof UI5_PROJECT_TYPE;

  root: string;
  ui5Config?: Configuration;
  app?: CachedApp;
}

type CAPProjectKind = "Java" | "NodeJS";
type Project = UI5Project | CAPProject;

async function getUI5Config(
  projectRoot: string
): Promise<Configuration | undefined> {
  try {
    const ui5YamlPath = join(projectRoot, FileName.Ui5Yaml);
    const yamlString = await readFile(ui5YamlPath, "utf-8");
    const ui5Config = await UI5Config.newInstance(yamlString);
    return ui5Config.getConfiguration();
  } catch {
    return undefined;
  }
}

async function getUI5Manifest(
  webappRoot: string
): Promise<Manifest | undefined> {
  try {
    const manifestPath = join(webappRoot, FileName.Manifest);
    const manifestString = await readFile(manifestPath, "utf-8");
    return JSON.parse(manifestString);
  } catch {
    return undefined;
  }
}

async function findAppRoot(path: string): Promise<string | undefined> {
  const manifestJson = await findUp(FileName.Manifest, { cwd: path });
  if (manifestJson) {
    const appRoot = await getAppRootFromWebappPath(manifestJson);
    return appRoot ?? undefined;
  }
  return undefined;
}

const cache: Map<string, Project> = new Map();

interface CachedApp {
  appRoot: string;
  projectRoot: string;
  manifest: Manifest;
  manifestDetails?: ManifestDetails;
  localServices: Map<string, ServiceDetails>;
}

// cache the semantic model creation promise to ensure unique instances per version

const semanticModelCache: Record<
  string,
  Promise<UI5SemanticModel>
> = Object.create(null);

async function getProject(root: string): Promise<Project> {
  const cachedProject = cache.get(root);
  if (cachedProject) {
    return cachedProject;
  }
  const typeAndKind = await getProjectTypeAndKind(root);
  if (typeAndKind.type === CAP_PROJECT_TYPE) {
    const project: CAPProject = {
      ...typeAndKind,
      root,
      services: new Map(),
      apps: new Map(),
    };
    await loadCapServices(project);
    cache.set(root, project);
    return project;
  } else {
    const ui5Config = await getUI5Config(root);
    const project: UI5Project = {
      ...typeAndKind,
      root,
      ui5Config,
    };
    cache.set(root, project);
    return project;
  }
}

async function getProjectTypeAndKind(
  projectRoot: string
): Promise<
  | { type: typeof CAP_PROJECT_TYPE; kind: CAPProjectKind }
  | { type: typeof UI5_PROJECT_TYPE }
> {
  if (await isCapJavaProject(projectRoot)) {
    return {
      type: CAP_PROJECT_TYPE,
      kind: "Java",
    };
  } else if (await isCapNodeJsProject(projectRoot)) {
    return {
      type: CAP_PROJECT_TYPE,
      kind: "NodeJS",
    };
  } else {
    return {
      type: UI5_PROJECT_TYPE,
    };
  }
}

async function findTopProjectRoot(documentPath): Promise<string | undefined> {
  let projectRoot: string | undefined;
  try {
    projectRoot = await findProjectRoot(documentPath, true);
    if (!projectRoot) {
      projectRoot = await findProjectRoot(documentPath, false);
    }
  } catch (e) {
    projectRoot = undefined;
  }
  return projectRoot;
}

export async function getContextForFile(
  uri: string,
  modelCachePath?: string
): Promise<AppContext> {
  const documentPath = fileURLToPath(uri);
  const projectRoot = await findTopProjectRoot(documentPath).catch(
    () => undefined
  );
  const appRoot = await findAppRoot(documentPath);
  const framework = getUI5FrameworkForXMLFile(documentPath);
  const project = projectRoot ? await getProject(projectRoot) : undefined;
  const app = project && appRoot ? await getApp(project, appRoot) : undefined;
  const minUI5Version =
    app?.manifestDetails?.minUI5Version ??
    getMinUI5VersionForXMLFile(documentPath);

  const ui5Model = await getSemanticModel(
    modelCachePath,
    app?.manifestDetails,
    framework,
    minUI5Version
  );

  const services = {};
  for (const [servicePath, service] of app?.localServices ??
    new Map<string, ServiceDetails>()) {
    services[servicePath] = {
      path: service.path,
      convertedMetadata: service.convertedMetadata,
    };
  }

  return {
    services,
    manifest: app?.manifestDetails,
    ui5Model,
  };
}

export async function getSemanticModel(
  modelCachePath: string | undefined,
  manifestDetails: ManifestDetails | undefined,
  framework: UI5Framework,
  version: string | undefined,
  ignoreCache?: boolean
): Promise<UI5SemanticModel> {
  return getSemanticModelWithFetcher(
    fetch,
    modelCachePath,
    framework,
    version,
    ignoreCache
  );
}

// This function is exported for testing purposes (using a mock fetcher)
export async function getSemanticModelWithFetcher(
  fetcher: Fetcher,
  modelCachePath: string | undefined,
  framework: UI5Framework,
  version: string | undefined,
  ignoreCache?: boolean
): Promise<UI5SemanticModel> {
  const frameWorkCacheKey = `${framework || "INVALID"}:${version || "INVALID"}`;
  if (ignoreCache || semanticModelCache[frameWorkCacheKey] === undefined) {
    semanticModelCache[frameWorkCacheKey] = createSemanticModelWithFetcher(
      fetcher,
      modelCachePath,
      framework,
      version
    );
  }
  return semanticModelCache[frameWorkCacheKey];
}
export async function updateManifestData(uri: string): Promise<void> {
  const path = fileURLToPath(uri);
  const projectRoot = await findProjectRoot(path, false).catch(() => undefined);
  const appRoot = await findAppRoot(path);
  if (!projectRoot || !appRoot) {
    return;
  }

  const project = await getProject(projectRoot);
  const app = await loadApp(project, appRoot);
  if (app) {
    if (project.type === CAP_PROJECT_TYPE) {
      project.apps.set(appRoot, app);
    } else {
      project.app = app;
    }
  }
}

export async function updateAppFile(uri: string): Promise<void> {
  const path = fileURLToPath(uri);
  const projectRoot = await findTopProjectRoot(path).catch(() => undefined);
  const appRoot = await findAppRoot(path);
  if (!projectRoot || !appRoot) {
    return;
  }

  const project = await getProject(projectRoot);
  const app = await loadApp(project, appRoot);
  if (app) {
    if (project.type === CAP_PROJECT_TYPE) {
      project.apps.set(appRoot, app);
    } else {
      project.app = app;
    }
  }
}

export async function updatePackageJson(uri: string): Promise<void> {
  const path = fileURLToPath(uri);
  const projectRoot = await findTopProjectRoot(path).catch(() => undefined);
  const appRoot = await findAppRoot(path);
  if (!projectRoot || !appRoot) {
    return;
  }

  cache.delete(projectRoot);

  const project = await getProject(projectRoot);
  const app = await loadApp(project, appRoot);
  if (app) {
    if (project.type === CAP_PROJECT_TYPE) {
      project.apps.set(appRoot, app);
    } else {
      project.app = app;
    }
  }
}

async function loadCapServices(project: CAPProject): Promise<void> {
  try {
    const data = await getCapModelAndServices(project.root);
    const cds = await loadModuleFromProject<any>(project.root, "@sap/cds");
    for (const service of data.services) {
      const metadataContent = cds.compile.to.edmx(data.model, {
        version: "v4",
        service: service.name,
        odataForeignKeys: true,
        odataContainment: false,
      });

      project.services.set(service.urlPath, metadataContent);
    }
  } catch (error) {
    console.log(error);
  }
  return undefined;
}

async function updateCapProject(project: CAPProject): Promise<void> {
  await loadCapServices(project);
  const updatedApps = new Map<string, CachedApp>();
  for (const [, app] of project.apps) {
    const updatedApp = await loadApp(project, app.appRoot);
    if (updatedApp) {
      updatedApps.set(app.appRoot, updatedApp);
    }
  }
  project.apps = updatedApps;
}

export async function updateServiceFiles(uris: string[]): Promise<void> {
  const projectRoots = new Set<string>();
  for (const uri of uris) {
    const path = fileURLToPath(uri);
    const projectRoot = await findTopProjectRoot(path).catch(() => undefined);
    if (projectRoot) {
      projectRoots.add(projectRoot);
    }
  }
  for (const projectRoot of projectRoots) {
    const project = await getProject(projectRoot);
    if (project.type === CAP_PROJECT_TYPE) {
      await updateCapProject(project);
    }
  }
}

async function getApp(
  project: Project,
  appRoot: string
): Promise<CachedApp | undefined> {
  if (project.type === UI5_PROJECT_TYPE) {
    if (project.app) {
      return project.app;
    }
    project.app = await loadApp(project, appRoot);
    return project.app;
  }

  const cachedApp = project.apps.get(appRoot);
  if (cachedApp) {
    return cachedApp;
  }

  const app = await loadApp(project, appRoot);
  if (app) {
    project.apps.set(appRoot, app);
  }

  return app;
}

async function loadApp(
  project: Project,
  appRoot: string
): Promise<CachedApp | undefined> {
  const manifest = await getUI5Manifest(appRoot);
  if (!manifest) {
    return undefined;
  }
  const manifestDetails = await getManifestDetails(manifest);
  const localServices = new Map<string, ServiceDetails>();
  const localServiceFiles = await getLocalServiceData(appRoot, manifest);
  if (localServiceFiles) {
    const metadata =
      project.type === CAP_PROJECT_TYPE
        ? project.services.get(localServiceFiles.path) ??
          project.services.get(localServiceFiles.path.replace(/^\//, ""))
        : undefined;
    if (metadata) {
      // override local service metadata with latest metadata from service
      localServiceFiles.metadataContent = metadata;
    }
    const localService = parseServiceFiles(localServiceFiles);
    if (localService) {
      localServices.set(localService.path, localService);
    }
  }
  const app: CachedApp = {
    projectRoot: project.root,
    appRoot,
    manifest,
    manifestDetails,
    localServices,
  };
  return app;
}

async function getManifestDetails(
  manifest: Manifest
): Promise<ManifestDetails> {
  const flexEnabled = manifest["sap.ui5"]?.flexEnabled;
  const minUI5Version = manifest["sap.ui5"]?.dependencies?.minUI5Version;
  const customViews = {};

  const targets = manifest["sap.ui5"]?.routing?.targets;
  if (targets) {
    for (const name of Object.keys(targets)) {
      const target = targets[name];
      if (target) {
        const settings = (target?.options as any)?.settings;
        if (settings?.entitySet && settings?.viewName) {
          customViews[settings.viewName] = {
            entitySet: settings.entitySet,
          };
        }
      }
    }
  }

  const mainServiceName = getMainService(manifest);
  const mainServicePath = mainServiceName
    ? getServicePath(manifest, mainServiceName)
    : undefined;
  return {
    flexEnabled: flexEnabled,
    minUI5Version: minUI5Version,
    mainServicePath,
    customViews,
  };
}

interface ServiceFiles {
  path: string;
  metadataContent: string | undefined;
  annotationFiles: string[];
}

function parseServiceFiles({
  metadataContent,
  annotationFiles,
  path,
}: ServiceFiles): ServiceDetails | undefined {
  if (!metadataContent) {
    return undefined;
  }

  const myParsedEdmx = parse(metadataContent, "metadata");
  const annotations = annotationFiles.map((file, i) =>
    parse(file, `annotationFile${i}`)
  );
  const mergedModel = merge(myParsedEdmx, ...annotations);

  const convertedMetadata = convert(mergedModel);

  const service: ServiceDetails = {
    path,
    convertedMetadata,
  };

  return service;
}

async function getLocalServiceData(
  appRoot: string,
  manifest: Manifest
): Promise<ServiceFiles | undefined> {
  const mainServiceName = getMainService(manifest);

  if (mainServiceName !== undefined) {
    const metadataContent = await getLocalMetadataForService(
      manifest,
      mainServiceName,
      appRoot
    );
    const annotationFiles = await getLocalAnnotationsForService(
      manifest,
      mainServiceName,
      appRoot
    );
    const path = getServicePath(manifest, mainServiceName) ?? "";

    return {
      path,
      metadataContent,
      annotationFiles,
    };
  }

  return undefined;
}

function getServicePath(
  manifest: Manifest,
  serviceName: string
): string | undefined {
  const dataSources = manifest["sap.app"]?.dataSources;

  if (dataSources && serviceName !== undefined) {
    const defaultModelDataSource = dataSources[serviceName];

    return defaultModelDataSource?.uri;
  }
  return undefined;
}

async function getLocalMetadataForService(
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
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

async function getLocalAnnotationsForService(
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
      } catch {
        return [];
      }
    }
  }
  return [];
}

function getMainService(manifest: Manifest): string | undefined {
  const model = manifest["sap.ovp"]?.globalFilterModel ?? "";
  return manifest["sap.ui5"]?.models?.[model].dataSource;
}

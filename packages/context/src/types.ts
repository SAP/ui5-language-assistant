import type {
  UI5SemanticModel,
  UI5Framework,
} from "@ui5-language-assistant/semantic-model-types";
import { ConvertedMetadata } from "@sap-ux/vocabularies-types";
import type { Manifest } from "@sap-ux/project-access";
import { FetchResponse } from "@ui5-language-assistant/logic-utils";

export const DEFAULT_UI5_FRAMEWORK = "SAPUI5";
export const DEFAULT_UI5_VERSION = "1.71.69";
export const DEFAULT_UI5_VERSION_BASE = "1.71";
export const UI5_VERSION_S4_PLACEHOLDER = "${sap.ui5.dist.version}";
export const UI5_FRAMEWORK_CDN_BASE_URL = {
  OpenUI5: "https://sdk.openui5.org/",
  SAPUI5: "https://ui5.sap.com/",
};
export const UI5_PROJECT_TYPE = "UI5";
export const CAP_PROJECT_TYPE = "CAP";
export enum DirName {
  Webapp = "webapp",
  Controller = "controller",
  View = "view",
  Fragment = "fragment",
  Ext = "ext",
}

export interface Context {
  ui5Model: UI5SemanticModel;
  manifestDetails: ManifestDetails;
  yamlDetails: YamlDetails;
  services: Record<string, ServiceDetails>;
  customViewId: string;
}

/**
 * @param path path to a service
 * @param convertedMetadata converted metadata of a service
 */
export interface ServiceDetails {
  path: string;
  convertedMetadata: ConvertedMetadata;
}

/**
 * @param flexEnabled an indicator whether an app is flex enabled
 * @param minUI5Version minimum version of UI5
 * @param mainServicePath path to a main OData service
 * @param customViews record of views id and their entity set
 * @param appId application id under `sap.app` namespace
 * @param manifestPath path to manifest.json file
 */
export type ManifestDetails = {
  flexEnabled: boolean;
  minUI5Version: string | undefined;
  mainServicePath: string | undefined;
  customViews: { [name: string]: { entitySet?: string; contextPath?: string } };
  appId: string;
  manifestPath: string;
};
/**
 * @param framework UI5 framework
 * @param version UI5 version
 */
export type YamlDetails = {
  framework: UI5Framework;
  version: string | undefined;
};

/**
 * @param appRoot root to an app
 * @param projectRoot root to a project
 * @param manifest manifest of an app
 * @param manifestDetails manifest details of an app
 * @param localServices local services of an app
 */
export interface App {
  appRoot: string;
  projectRoot: string;
  manifest: Manifest;
  manifestDetails: ManifestDetails;
  localServices: Map<string, ServiceDetails>;
}
/**
 * @param type type of project
 * @param kind kind of a project
 * @param root root of a project
 * @param apps map of project app
 */
export interface CAPProject {
  type: typeof CAP_PROJECT_TYPE;
  kind: CAPProjectKind;
  root: string;
  apps: Map<string, App>;
}
/**
 * @param path path to a service
 * @param metadataContent content of a metadata of a service
 * @param annotationFiles annotation files of a services
 */
export interface ServiceFiles {
  path: string;
  metadataContent: string | undefined;
  annotationFiles: string[];
}

/**
 * @param type type of project
 * @param root root of a project
 * @param app app of a project
 */
export interface UI5Project {
  type: typeof UI5_PROJECT_TYPE;
  root: string;
  app: App;
}

export type CAPProjectKind = "Java" | "NodeJS";
export type ProjectKind = CAPProjectKind | "UI5";
export type Project = UI5Project | CAPProject;
export type ProjectType = typeof UI5_PROJECT_TYPE | typeof CAP_PROJECT_TYPE;
export type Fetcher<T = unknown> = (url: string) => Promise<FetchResponse<T>>;

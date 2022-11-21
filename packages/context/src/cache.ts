import type { Manifest } from "@sap-ux/project-access";
import type { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";

import type { App, Project, YamlDetails } from "./types";

type AbsoluteAppRoot = string;
type AbsoluteProjectRoot = string;

class ProjectCache {
  private _manifest: Map<AbsoluteAppRoot, Manifest>;
  private _app: Map<AbsoluteAppRoot, App>;
  private _project: Map<AbsoluteAppRoot, Project>;
  private _capServices: Map<AbsoluteProjectRoot, Map<string, string>>;
  private _ui5YamlDetails: Map<string, YamlDetails>;
  private _ui5Model: Map<string, UI5SemanticModel>;
  constructor() {
    this._project = new Map();
    this._manifest = new Map();
    this._app = new Map();
    this._capServices = new Map();
    this._ui5YamlDetails = new Map();
    this._ui5Model = new Map();
  }
  reset() {
    this._project = new Map();
    this._manifest = new Map();
    this._app = new Map();
    this._capServices = new Map();
    this._ui5YamlDetails = new Map();
    this._ui5Model = new Map();
  }
  /**
   * Get entries of cached project
   */
  getProjectEntries(): string[] {
    return [...this._project.keys()];
  }
  getProject(projectRoot: AbsoluteProjectRoot): Project | undefined {
    return this._project.get(projectRoot);
  }
  setProject(projectRoot: AbsoluteProjectRoot, data: Project): void {
    this._project.set(projectRoot, data);
  }
  deleteProject(projectRoot: AbsoluteProjectRoot): boolean {
    return this._project.delete(projectRoot);
  }
  /**
   * Get entries of cached manifest
   */
  getManifestEntries(): string[] {
    return [...this._manifest.keys()];
  }
  getManifest(manifestRoot: string): Manifest | undefined {
    return this._manifest.get(manifestRoot);
  }
  setManifest(manifestRoot: string, data: Manifest): void {
    this._manifest.set(manifestRoot, data);
  }
  deleteManifest(manifestRoot: string): boolean {
    return this._manifest.delete(manifestRoot);
  }
  /**
   * Get entries of cached app
   */
  getAppEntries(): string[] {
    return [...this._app.keys()];
  }
  getApp(appRoot: string): App | undefined {
    return this._app.get(appRoot);
  }
  setApp(appRoot: string, data: App): void {
    this._app.set(appRoot, data);
  }
  deleteApp(appRoot: string): boolean {
    return this._app.delete(appRoot);
  }
  /**
   * Get entries of cached cap services
   */
  getCapServiceEntries(): string[] {
    return [...this._capServices.keys()];
  }
  getCapServices(
    projectRoot: AbsoluteProjectRoot
  ): Map<string, string> | undefined {
    return this._capServices.get(projectRoot);
  }
  setCapServices(
    projectRoot: AbsoluteProjectRoot,
    data: Map<string, string>
  ): void {
    this._capServices.set(projectRoot, data);
  }
  deleteCapServices(projectRoot: AbsoluteProjectRoot): boolean {
    return this._capServices.delete(projectRoot);
  }
  /**
   * Get entries of cached yaml details
   */
  getYamlDetailsEntries(): string[] {
    return [...this._ui5YamlDetails.keys()];
  }
  getYamlDetails(documentPath: string): YamlDetails | undefined {
    return this._ui5YamlDetails.get(documentPath);
  }
  setYamlDetails(documentPath: string, data: YamlDetails): void {
    this._ui5YamlDetails.set(documentPath, data);
  }
  deleteYamlDetails(documentPath: string): boolean {
    return this._ui5YamlDetails.delete(documentPath);
  }
  /**
   * Get entries of cached UI5 model
   */
  getUI5ModelEntries(): string[] {
    return [...this._ui5Model.keys()];
  }
  getUI5Model(key: string): UI5SemanticModel | undefined {
    return this._ui5Model.get(key);
  }
  setUI5Model(key: string, data: UI5SemanticModel): void {
    this._ui5Model.set(key, data);
  }
  deleteUI5Model(key: string): boolean {
    return this._ui5Model.delete(key);
  }
}

/**
 * Create singleton instance of ProjectCache
 */
const cache = new ProjectCache();
export { cache };

import type { Manifest } from "@sap-ux/project-access";
import type { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import type { XMLDocument } from "@xml-tools/ast";
import type { App, DocPath, Project, WebApp, YamlDetails } from "./types";

type AbsoluteAppRoot = string;
type AbsoluteProjectRoot = string;

class Cache {
  private manifest: Map<AbsoluteAppRoot, Manifest>;
  private app: Map<AbsoluteAppRoot, App>;
  private project: Map<AbsoluteAppRoot, Project>;
  private CAPServices: Map<AbsoluteProjectRoot, Map<string, string>>;
  private ui5YamlDetails: Map<string, YamlDetails>;
  private ui5Model: Map<string, UI5SemanticModel>;
  private viewFiles: Record<string, Record<string, XMLDocument>>;
  constructor() {
    this.project = new Map();
    this.manifest = new Map();
    this.app = new Map();
    this.CAPServices = new Map();
    this.ui5YamlDetails = new Map();
    this.ui5Model = new Map();
    this.viewFiles = {};
  }
  reset() {
    this.project = new Map();
    this.manifest = new Map();
    this.app = new Map();
    this.CAPServices = new Map();
    this.ui5YamlDetails = new Map();
    this.ui5Model = new Map();
    this.viewFiles = {};
  }
  /**
   * Get entries of cached project
   */
  getProjectEntries(): string[] {
    return [...this.project.keys()];
  }
  getProject(projectRoot: AbsoluteProjectRoot): Project | undefined {
    return this.project.get(projectRoot);
  }
  setProject(projectRoot: AbsoluteProjectRoot, data: Project): void {
    this.project.set(projectRoot, data);
  }
  deleteProject(projectRoot: AbsoluteProjectRoot): boolean {
    return this.project.delete(projectRoot);
  }
  /**
   * Get entries of cached manifest
   */
  getManifestEntries(): string[] {
    return [...this.manifest.keys()];
  }
  getManifest(manifestRoot: string): Manifest | undefined {
    return this.manifest.get(manifestRoot);
  }
  setManifest(manifestRoot: string, data: Manifest): void {
    this.manifest.set(manifestRoot, data);
  }
  deleteManifest(manifestRoot: string): boolean {
    return this.manifest.delete(manifestRoot);
  }
  /**
   * Get entries of cached app
   */
  getAppEntries(): string[] {
    return [...this.app.keys()];
  }
  getApp(appRoot: string): App | undefined {
    return this.app.get(appRoot);
  }
  setApp(appRoot: string, data: App): void {
    this.app.set(appRoot, data);
  }
  deleteApp(appRoot: string): boolean {
    return this.app.delete(appRoot);
  }
  /**
   * Get entries of cached CAP services
   */
  getCAPServiceEntries(): string[] {
    return [...this.CAPServices.keys()];
  }
  getCAPServices(
    projectRoot: AbsoluteProjectRoot
  ): Map<string, string> | undefined {
    return this.CAPServices.get(projectRoot);
  }
  setCAPServices(
    projectRoot: AbsoluteProjectRoot,
    data: Map<string, string>
  ): void {
    this.CAPServices.set(projectRoot, data);
  }
  deleteCAPServices(projectRoot: AbsoluteProjectRoot): boolean {
    return this.CAPServices.delete(projectRoot);
  }
  /**
   * Get entries of cached yaml details
   */
  getYamlDetailsEntries(): string[] {
    return [...this.ui5YamlDetails.keys()];
  }
  getYamlDetails(documentPath: string): YamlDetails | undefined {
    return this.ui5YamlDetails.get(documentPath);
  }
  setYamlDetails(documentPath: string, data: YamlDetails): void {
    this.ui5YamlDetails.set(documentPath, data);
  }
  deleteYamlDetails(documentPath: string): boolean {
    return this.ui5YamlDetails.delete(documentPath);
  }
  /**
   * Get entries of cached UI5 model
   */
  getUI5ModelEntries(): string[] {
    return [...this.ui5Model.keys()];
  }
  getUI5Model(key: string): UI5SemanticModel | undefined {
    return this.ui5Model.get(key);
  }
  setUI5Model(key: string, data: UI5SemanticModel): void {
    this.ui5Model.set(key, data);
  }
  deleteUI5Model(key: string): boolean {
    return this.ui5Model.delete(key);
  }
  /**
   * Get entries of view files
   */
  getViewFiles(webapp: WebApp): Record<DocPath, XMLDocument> {
    return this.viewFiles[webapp] ?? {};
  }
  setViewFiles(webapp: WebApp, viewFiles: Record<DocPath, XMLDocument>): void {
    this.viewFiles[webapp] = viewFiles;
  }
}

/**
 * Create singleton instance of Cache
 */
const cache = new Cache();
export { cache };

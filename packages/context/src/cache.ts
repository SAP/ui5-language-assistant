import type { Manifest } from "@sap-ux/project-access";
import type { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { accept, type XMLDocument } from "@xml-tools/ast";
import type {
  App,
  ControlIdLocation,
  DocumentPath,
  Project,
  YamlDetails,
} from "./types";
import { createDocumentAst } from "./utils";
import { IdsCollectorVisitor } from "./utils";

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
  private controlIds: Record<
    string,
    Record<DocumentPath, Map<string, ControlIdLocation[]>>
  >;
  constructor() {
    this.project = new Map();
    this.manifest = new Map();
    this.app = new Map();
    this.CAPServices = new Map();
    this.ui5YamlDetails = new Map();
    this.ui5Model = new Map();
    this.viewFiles = {};
    this.controlIds = {};
  }
  reset() {
    this.project = new Map();
    this.manifest = new Map();
    this.app = new Map();
    this.CAPServices = new Map();
    this.ui5YamlDetails = new Map();
    this.ui5Model = new Map();
    this.viewFiles = {};
    this.controlIds = {};
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
  getViewFiles(manifestPath: string): Record<DocumentPath, XMLDocument> {
    return this.viewFiles[manifestPath] ?? {};
  }

  setViewFiles(
    manifestPath: string,
    viewFiles: Record<DocumentPath, XMLDocument>
  ): void {
    this.viewFiles[manifestPath] = viewFiles;
  }

  /**
   * Set view file. Use this API to manipulate cache for single view file. This is to avoid cache manipulation outside of cache file.
   *
   * @param param - The parameter object
   * @param param.manifestPath - The path to the manifest.json
   * @param param.documentPath - The path to the document
   * @param param.operation - The operation to be performed (create or delete)
   * @param param.content - The content of the document (optional, only required for 'create' operation)
   * @returns - A Promise that resolves to void
   */
  async setViewFile(param: {
    manifestPath: string;
    documentPath: string;
    operation: "create" | "delete";
    content?: string;
  }): Promise<void> {
    const { manifestPath, documentPath, operation, content } = param;
    if (operation === "create") {
      const viewFiles = this.getViewFiles(manifestPath);
      viewFiles[documentPath] = await createDocumentAst(documentPath, content);
      this.setViewFiles(manifestPath, viewFiles);
      return;
    }

    const viewFiles = this.getViewFiles(manifestPath);
    delete viewFiles[documentPath];
    this.setViewFiles(manifestPath, viewFiles);
  }
  /**
   * Get entries of control ids
   */
  getControlIds(
    manifestPath: string
  ): Record<DocumentPath, Map<string, ControlIdLocation[]>> {
    return this.controlIds[manifestPath] ?? {};
  }
  setControlIds(
    manifestPath: string,
    controlIds: Record<DocumentPath, Map<string, ControlIdLocation[]>>
  ) {
    this.controlIds[manifestPath] = controlIds;
  }

  /**
   * Set control's id for xml view. Use this API to manipulate cache for controls ids of a single view file. This is to avoid cache manipulation out side of cache file.
   *
   * @param manifestPath - The path to the manifest.json
   * @param documentPath - The path to the document
   * @param param.operation - The operation to be performed (create or delete)
   */
  setControlIdsForViewFile(param: {
    manifestPath: string;
    documentPath: string;
    operation: "create" | "delete";
  }): void {
    const { manifestPath, documentPath, operation } = param;

    if (operation === "create") {
      const viewFiles = this.getViewFiles(manifestPath);
      // for current document, re-collect and re-assign it to avoid cache issue
      if (viewFiles[documentPath]) {
        const idCollector = new IdsCollectorVisitor(documentPath);
        accept(viewFiles[documentPath], idCollector);
        this.controlIds[manifestPath][documentPath] =
          idCollector.getControlIds();
      }
      return;
    }

    const idControls = this.getControlIds(manifestPath);
    delete idControls[documentPath];
    this.setControlIds(manifestPath, idControls);
  }
}

/**
 * Create singleton instance of Cache
 */
const cache = new Cache();
export { cache };

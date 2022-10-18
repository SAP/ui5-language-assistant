import {
  ManifestDetails,
  UI5SemanticModel,
  YamlDetails,
} from "@ui5-language-assistant/semantic-model-types";

type AbsolutePathToManifest = string;
type AbsolutePathToYaml = string;
class ProjectCache {
  private _manifestDetails: Map<AbsolutePathToManifest, ManifestDetails>;
  private _ui5YamlDetails: Map<AbsolutePathToYaml, YamlDetails>;
  private _ui5Model: Map<string, UI5SemanticModel>;
  constructor() {
    this._manifestDetails = new Map();
    this._ui5YamlDetails = new Map();
    this._ui5Model = new Map();
  }

  /**
   * Get entries of cached manifest details
   */
  getManifestDetailsEntries(): string[] {
    return [...this._manifestDetails.keys()];
  }
  getManifestDetails(documentPath: string): ManifestDetails | undefined {
    return this._manifestDetails.get(documentPath);
  }
  setManifestDetails(documentPath: string, data: ManifestDetails): void {
    this._manifestDetails.set(documentPath, data);
  }
  deleteManifestDetails(documentPath: string): boolean {
    return this._manifestDetails.delete(documentPath);
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

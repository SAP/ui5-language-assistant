import {
  Uri,
  TextDocumentContentProvider,
  EventEmitter,
  ExtensionContext,
  window,
} from "vscode";
import { tryFetch } from "@ui5-language-assistant/logic-utils";
import { SCHEMA_URI_V1, MANIFEST_SCHEMA, SCHEMA_URI_V2 } from "./constants";
import { getSchemaContent } from "./utils";
import {
  findManifestPath,
  getUI5Manifest,
} from "@ui5-language-assistant/context";

class ManifestSchemaProvider implements TextDocumentContentProvider {
  private _schemaContent = "";
  set schemaContent(content: string) {
    this._schemaContent = content;
  }
  get schemaContent(): string {
    return this._schemaContent;
  }
  onDidChange() {
    return new EventEmitter<Uri>();
  }
  provideTextDocumentContent(uri: Uri): string {
    if (MANIFEST_SCHEMA === uri.scheme) {
      return this.schemaContent;
    }
    return "";
  }
}

const schemaProvider = new ManifestSchemaProvider();

/**
 * Get manifest schema provider. It first tries to load "schema.json" over internet. If it fails, it tries
 * to read it from local resource
 */
export const getManifestSchemaProvider = async (
  context: ExtensionContext
): Promise<ManifestSchemaProvider> => {
  let content = "";
  const activeEditor = window.activeTextEditor;
  if (!activeEditor) {
    return schemaProvider;
  }
  const filePath = activeEditor.document.uri.fsPath;
  const manifestPath = await findManifestPath(filePath);
  if (!manifestPath) {
    return schemaProvider;
  }
  const manifest = await getUI5Manifest(manifestPath);
  if (!manifest) {
    return schemaProvider;
  }
  // default v1.x
  let SCHEMA_URI = SCHEMA_URI_V1;
  // if schema start with 2, try master uri for v2.x
  if (manifest._version?.startsWith("2.")) {
    SCHEMA_URI = SCHEMA_URI_V2;
  }
  const response = await tryFetch(SCHEMA_URI);
  if (response) {
    content = await response.text();
  } else {
    content = await getSchemaContent(context, manifest._version);
  }
  schemaProvider.schemaContent = content;
  return schemaProvider;
};

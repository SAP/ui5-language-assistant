import {
  Uri,
  TextDocumentContentProvider,
  EventEmitter,
  ExtensionContext,
  window,
} from "vscode";
import { tryFetch } from "@ui5-language-assistant/logic-utils";
import { MANIFEST_SCHEMA } from "./constants";
import { getSchemaContent, getSchemaUri } from "./utils";
import {
  findManifestPath,
  getUI5Manifest,
  ManifestVersionChange,
} from "@ui5-language-assistant/context";

class ManifestSchemaProvider implements TextDocumentContentProvider {
  private _schemaContent = "";
  readonly _onDidChange = new EventEmitter<Uri>();

  readonly onDidChange = this._onDidChange.event;

  set schemaContent(content: string) {
    this._schemaContent = content;
  }
  get schemaContent(): string {
    return this._schemaContent;
  }

  fireContentChange(uri: Uri): void {
    this._onDidChange.fire(uri);
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
  context: ExtensionContext,
  manifestVersionChanged?: ManifestVersionChange
): Promise<ManifestSchemaProvider> => {
  let content = "";
  let version = "";
  if (manifestVersionChanged) {
    version = manifestVersionChanged.newVersion;
  } else {
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
    version = manifest._version;
  }

  const SCHEMA_URI = getSchemaUri(version);
  // try specific schema version over internet
  const response = await tryFetch(SCHEMA_URI);
  if (response) {
    content = await response.text();
  } else {
    // fallback to local schema which is based on main branch
    content = await getSchemaContent(context, version);
  }
  schemaProvider.schemaContent = content;
  if (manifestVersionChanged) {
    schemaProvider.fireContentChange(Uri.parse(`${MANIFEST_SCHEMA}://local`));
  }
  return schemaProvider;
};

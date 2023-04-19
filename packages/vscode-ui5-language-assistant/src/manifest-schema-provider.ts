import {
  Uri,
  TextDocumentContentProvider,
  EventEmitter,
  ExtensionContext,
} from "vscode";
import { tryFetch } from "@ui5-language-assistant/logic-utils";
import { SCHEMA_URI, MANIFEST_SCHEMA } from "./constants";
import { getSchemaContent } from "./utils";

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
  const response = await tryFetch(SCHEMA_URI);
  if (response) {
    content = await response.text();
  } else {
    content = await getSchemaContent(context);
  }
  schemaProvider.schemaContent = content;
  return schemaProvider;
};

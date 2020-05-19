/* istanbul ignore file */
import {
  createConnection,
  TextDocuments,
  TextDocumentSyncKind,
  ProposedFeatures,
  TextDocumentPositionParams,
  CompletionItem,
  InitializeParams,
  Hover,
  DidChangeConfigurationNotification,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { getSemanticModel } from "./ui5-model";
import { getCompletionItems } from "./completion-items";
import { ServerInitializationOptions } from "../api";
import { getXMLViewDiagnostics } from "./xml-view-diagnostics";
import { getHoverResponse } from "./hover";
import {
  clearSettings,
  setGlobalSettings,
  clearDocumentSettings,
  setSettingsForDocument,
  hasSettingsForDocument,
} from "@ui5-language-assistant/settings";

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);
let getSemanticModelPromise: Promise<UI5SemanticModel> | undefined = undefined;
let initializationOptions: ServerInitializationOptions | undefined;
let hasConfigurationCapability = false;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;
  // Does the client support the `workspace/configuration` request?
  // If not, we will fall back using global settings
  hasConfigurationCapability =
    capabilities.workspace !== undefined &&
    (capabilities.workspace.configuration ?? false);

  // These options are passed from the client extension in clientOptions.initializationOptions
  initializationOptions = params.initializationOptions;
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      completionProvider: {
        resolveProvider: true,
        // TODO: can the trigger characters be more contextual?
        //       e.g: "<" of open tag only, not else where
        triggerCharacters: ['"', "'", ":", "<"],
      },
      hoverProvider: true,
    },
  };
});

connection.onInitialized(async () => {
  getSemanticModelPromise = getSemanticModel(
    initializationOptions?.modelCachePath
  );

  if (hasConfigurationCapability) {
    // Register for all configuration changes
    connection.client.register(
      DidChangeConfigurationNotification.type,
      undefined
    );
  }
});

connection.onCompletion(
  async (
    textDocumentPosition: TextDocumentPositionParams
  ): Promise<CompletionItem[]> => {
    if (getSemanticModelPromise !== undefined) {
      const model = await getSemanticModelPromise;
      const documentUri = textDocumentPosition.textDocument.uri;
      const document = documents.get(documentUri);
      if (document) {
        updateDocumentSettings(document.uri);
        return getCompletionItems({ model, textDocumentPosition, document });
      }
    }
    return [];
  }
);

connection.onCompletionResolve(
  (item: CompletionItem): CompletionItem => {
    return item;
  }
);

connection.onHover(
  async (
    textDocumentPosition: TextDocumentPositionParams
  ): Promise<Hover | undefined> => {
    if (getSemanticModelPromise !== undefined) {
      const model = await getSemanticModelPromise;
      const documentUri = textDocumentPosition.textDocument.uri;
      const document = documents.get(documentUri);
      if (document) {
        return getHoverResponse(model, textDocumentPosition, document);
      }
    }
    return undefined;
  }
);

documents.onDidChangeContent(async (changeEvent) => {
  if (getSemanticModelPromise === undefined) {
    return;
  }
  const ui5Model = await getSemanticModelPromise;
  // TODO: should we check we are dealing with a *.[view|fragment].xml?
  //       The client does this, but perhaps we should be extra defensive in case of
  //       additional clients.
  const documentUri = changeEvent.document.uri;
  const document = documents.get(documentUri);
  if (document !== undefined) {
    const diagnostics = getXMLViewDiagnostics({ document, ui5Model });
    connection.sendDiagnostics({ uri: changeEvent.document.uri, diagnostics });
  }
});

function updateDocumentSettings(resource: string): void {
  if (!hasConfigurationCapability) {
    return;
  }
  if (!hasSettingsForDocument(resource)) {
    const result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: "UI5LanguageAssistant",
    });
    setSettingsForDocument(resource, result);
  }
}

connection.onDidChangeConfiguration((change) => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    clearSettings();
  } else {
    if (change.settings.UI5LanguageAssistant !== undefined) {
      setGlobalSettings(change.settings.UI5LanguageAssistant);
    }
  }
  // No further actions are required currently during configuration change. In the future we might want to
  // re-validate the files.
});

// Only keep settings for open documents
documents.onDidClose((e) => {
  clearDocumentSettings(e.document.uri);
});

documents.listen(connection);

connection.listen();

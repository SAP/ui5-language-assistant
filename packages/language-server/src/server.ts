/* istanbul ignore file */
import { forEach } from "lodash";
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
  CodeAction,
  ExecuteCommandParams,
  TextDocumentEdit,
  CreateFile,
  RenameFile,
  DeleteFile,
} from "vscode-languageserver";
import { URI } from "vscode-uri";
import { TextDocument } from "vscode-languageserver-textdocument";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  clearSettings,
  setGlobalSettings,
  clearDocumentSettings,
  setSettingsForDocument,
  hasSettingsForDocument,
  getSettingsForDocument,
} from "@ui5-language-assistant/settings";
import { ServerInitializationOptions } from "../api";
import { getSemanticModel } from "./ui5-model";
import { getCompletionItems } from "./completion-items";
import { getXMLViewDiagnostics } from "./xml-view-diagnostics";
import { getHoverResponse } from "./hover";
import {
  getFlexEnabledFlagForXMLFile,
  isManifestDoc,
  initializeManifestData,
  updateManifestData,
} from "./manifest-handling";
import {
  getQuickFixCodeAction,
  executeQuickFixIdCommand,
  QUICK_FIX_STABLE_ID,
} from "./quick-fix";

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);
let semanticModelLoaded: Promise<UI5SemanticModel> | undefined = undefined;
let manifestStateInitialized: Promise<void[]> | undefined = undefined;
let initializationOptions: ServerInitializationOptions | undefined;
let hasConfigurationCapability = false;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;
  const workspaceFolderUri = params.rootUri;
  if (workspaceFolderUri !== null) {
    const workspaceFolderAbsPath = URI.parse(workspaceFolderUri).fsPath;
    manifestStateInitialized = initializeManifestData(workspaceFolderAbsPath);
  }

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
      codeActionProvider: true,
      // Each command executes a different code action scenario
      executeCommandProvider: {
        commands: [QUICK_FIX_STABLE_ID],
      },
    },
  };
});

connection.onInitialized(async () => {
  semanticModelLoaded = getSemanticModel(initializationOptions?.modelCachePath);

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
    if (semanticModelLoaded !== undefined) {
      const model = await semanticModelLoaded;
      const documentUri = textDocumentPosition.textDocument.uri;
      const document = documents.get(documentUri);
      if (document) {
        ensureDocumentSettingsUpdated(document.uri);
        const documentSettings = await getSettingsForDocument(document.uri);
        return getCompletionItems({
          model,
          textDocumentPosition,
          document,
          documentSettings,
        });
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
    if (semanticModelLoaded !== undefined) {
      const model = await semanticModelLoaded;
      const documentUri = textDocumentPosition.textDocument.uri;
      const document = documents.get(documentUri);
      if (document) {
        return getHoverResponse(model, textDocumentPosition, document);
      }
    }
    return undefined;
  }
);

connection.onDidChangeWatchedFiles(async (changeEvent) => {
  forEach(changeEvent.changes, async (change) => {
    const uri = change.uri;
    if (!isManifestDoc(uri)) {
      return;
    }

    await updateManifestData(uri, change.type);
  });
});

documents.onDidChangeContent(async (changeEvent) => {
  if (
    semanticModelLoaded === undefined ||
    manifestStateInitialized === undefined ||
    !isXMLView(changeEvent.document.uri)
  ) {
    return;
  }

  const ui5Model = await semanticModelLoaded;
  await manifestStateInitialized;
  const documentUri = changeEvent.document.uri;
  const document = documents.get(documentUri);
  if (document !== undefined) {
    const documentPath = URI.parse(documentUri).fsPath;
    const flexEnabled = getFlexEnabledFlagForXMLFile(documentPath);
    const diagnostics = getXMLViewDiagnostics({
      document,
      ui5Model,
      flexEnabled,
    });
    connection.sendDiagnostics({ uri: changeEvent.document.uri, diagnostics });
  }
});

connection.onCodeAction((params) => {
  const docUri = params.textDocument.uri;
  const codeActions: CodeAction[] = [];
  const textDocument = documents.get(docUri);
  if (textDocument === undefined) {
    return undefined;
  }

  const diagnostics = params.context.diagnostics;
  forEach(diagnostics, (_) => {
    const codeAction = getQuickFixCodeAction(textDocument, _);
    if (codeAction !== undefined) {
      codeActions.push(codeAction);
    }
  });

  return codeActions;
});

connection.onExecuteCommand(async (params) => {
  if (params.arguments === undefined) {
    return;
  }

  const textDocument = documents.get(params.arguments[0]);
  if (textDocument === undefined) {
    return;
  }

  const textEdit = executeCommand(textDocument, params);
  if (textEdit !== undefined) {
    connection.workspace.applyEdit({
      documentChanges: textEdit,
    });
  }
});

function ensureDocumentSettingsUpdated(resource: string): void {
  // There are 2 flows for settings, depending on the client capabilities:
  // 1. The client doesn't support workspace/document-level settings (workspace/configuration request).
  //    In this case we use global settings (which arrive in onDidChangeConfiguration) and don't try to fetch the
  //    workspace/document settings.
  // 2. The client supports workspace/configuration request.
  //    In this case we ask for the document's settings when we need them (if we don't already have them),
  //    and clear all the document settings when the configuration changes (onDidChangeConfiguration).
  // The settings can be configured (in the client) on the user level, workspace level or (on theia) folder level,
  // using fallback logic from the most specific to most general, so we keep it cached on the document level.
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

function isXMLView(uri: string): boolean {
  return /(view|fragment)\.xml$/.test(uri);
}

function executeCommand(
  textDocument: TextDocument,
  params: ExecuteCommandParams
): (TextDocumentEdit | CreateFile | RenameFile | DeleteFile)[] | undefined {
  switch (params.command) {
    case QUICK_FIX_STABLE_ID: {
      return executeQuickFixIdCommand({
        textDocument,
        // @ts-expect-error - we already checked arguments exist
        quickFixRange: params.arguments[1],
        // @ts-expect-error - we already checked arguments exist
        quickFixIDSuggestion: params.arguments[2],
      });
    }
    default:
      return undefined;
  }
}

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
  FileEvent,
  InitializeResult,
  Diagnostic,
} from "vscode-languageserver/node";
import { URI } from "vscode-uri";
import { TextDocument } from "vscode-languageserver-textdocument";
import {
  clearSettings,
  setGlobalSettings,
  clearDocumentSettings,
  setSettingsForDocument,
  hasSettingsForDocument,
  getSettingsForDocument,
  setConfigurationSettings,
  Settings,
  getConfigurationSettings,
} from "@ui5-language-assistant/settings";
import { commands } from "@ui5-language-assistant/user-facing-text";
import { ServerInitializationOptions } from "../api";
import { getCompletionItems } from "./completion-items";
import {
  getXMLViewDiagnostics,
  getXMLViewIdDiagnostics,
} from "./xml-view-diagnostics";
import { getHoverResponse } from "./hover";
import {
  initializeManifestData,
  initializeUI5YamlData,
  reactOnUI5YamlChange,
  getContext,
  reactOnManifestChange,
  reactOnCdsFileChange,
  reactOnXmlFileChange,
  reactOnViewFileChange,
  reactOnPackageJson,
  isContext,
  Context,
  getManifestVersion,
} from "@ui5-language-assistant/context";
import { diagnosticToCodeActionFix } from "./quick-fix";
import { executeCommand } from "./commands";
import { initSwa } from "./swa";
import { getLogger, setLogLevel } from "./logger";
import { initI18n } from "./i18n";
import { isXMLView, getCDNBaseUrl } from "@ui5-language-assistant/logic-utils";
import { getDefinition } from "@ui5-language-assistant/xml-views-definition";
import { handleContextError } from "./utils";

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);
let manifestStateInitialized: Promise<void[]> | undefined = undefined;
let ui5yamlStateInitialized: Promise<void[]> | undefined = undefined;
let initializationOptions: ServerInitializationOptions | undefined;
let hasConfigurationCapability = false;

const documentsDiagnostics = new Map<string, Diagnostic[]>();

connection.onInitialize(
  async (params: InitializeParams): Promise<InitializeResult> => {
    getLogger().info("`onInitialize` event", params);
    if (params?.initializationOptions?.logLevel) {
      setLogLevel(params?.initializationOptions?.logLevel);
    }
    initSwa(params);
    await initI18n();

    const capabilities = params.capabilities;
    const workspaceFolderUri = params.rootUri;
    if (workspaceFolderUri !== null) {
      const workspaceFolderAbsPath = URI.parse(workspaceFolderUri).fsPath;
      manifestStateInitialized = initializeManifestData(workspaceFolderAbsPath);
      ui5yamlStateInitialized = initializeUI5YamlData(workspaceFolderAbsPath);
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
          triggerCharacters: ['"', "'", ":", "<", "/"],
        },
        hoverProvider: true,
        definitionProvider: true,
        codeActionProvider: true,
        // Each command executes a different code action scenario
        executeCommandProvider: {
          commands: [
            commands.QUICK_FIX_STABLE_ID_ERROR.name,
            commands.QUICK_FIX_STABLE_ID_FILE_ERRORS.name,
          ],
        },
      },
    };
  }
);

connection.onDefinition(getDefinition);

connection.onInitialized(async (): Promise<void> => {
  getLogger().info("`onInitialized` event");
  if (hasConfigurationCapability) {
    // Register for all configuration changes
    connection.client.register(DidChangeConfigurationNotification.type, {
      section: "UI5LanguageAssistant",
    });
    // set config settings
    const result = (await connection.workspace.getConfiguration({
      section: "UI5LanguageAssistant",
    })) as Settings;
    setConfigurationSettings(result);
  }
});

connection.onCompletion(
  async (
    textDocumentPosition: TextDocumentPositionParams
  ): Promise<CompletionItem[]> => {
    try {
      getLogger().debug("`onCompletion` event", {
        textDocumentPosition,
      });
      const documentUri = textDocumentPosition.textDocument.uri;
      const document = documents.get(documentUri);
      if (document) {
        const documentPath = URI.parse(documentUri).fsPath;
        const context = await getContext(
          documentPath,
          initializationOptions?.modelCachePath
        );
        if (!isContext(context)) {
          handleContextError(context);
          return [];
        }
        const version = context.ui5Model.version;
        const framework = context.yamlDetails.framework;
        const isFallback = context.ui5Model.isFallback;
        const isIncorrectVersion = context.ui5Model.isIncorrectVersion;
        const url = await getCDNBaseUrl(framework, version);
        connection.sendNotification("UI5LanguageAssistant/ui5Model", {
          url,
          framework,
          version,
          isFallback,
          isIncorrectVersion,
        });
        ensureDocumentSettingsUpdated(document.uri);
        const documentSettings = await getSettingsForDocument(document.uri);
        const completionItems = getCompletionItems({
          context,
          textDocumentPosition,
          document,
          documentSettings,
        });
        getLogger().trace("computed completion items", {
          completionItems,
        });
        return completionItems;
      }
      return [];
    } catch (error) {
      getLogger().error("`onCompletion` error", { error });
      return [];
    }
  }
);

connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
  return item;
});

connection.onHover(
  async (
    textDocumentPosition: TextDocumentPositionParams
  ): Promise<Hover | undefined> => {
    try {
      getLogger().debug("`onHover` event", {
        textDocumentPosition,
      });
      const documentUri = textDocumentPosition.textDocument.uri;
      const document = documents.get(documentUri);
      if (document) {
        const documentPath = URI.parse(documentUri).fsPath;
        const context = await getContext(
          documentPath,
          initializationOptions?.modelCachePath
        );
        if (!isContext(context)) {
          handleContextError(context);
          return;
        }
        const version = context.ui5Model.version;
        const framework = context.yamlDetails.framework;
        const isFallback = context.ui5Model.isFallback;
        const isIncorrectVersion = context.ui5Model.isIncorrectVersion;
        const url = await getCDNBaseUrl(framework, version);
        connection.sendNotification("UI5LanguageAssistant/ui5Model", {
          url,
          framework,
          version,
          isFallback,
          isIncorrectVersion,
        });
        const hoverResponse = getHoverResponse(
          context,
          textDocumentPosition,
          document
        );
        getLogger().trace("computed hoverResponse", {
          hoverResponse,
        });
        return hoverResponse;
      }
    } catch (error) {
      getLogger().error("`onHover` error", { error });
      return undefined;
    }
    return undefined;
  }
);

/**
 * Validate all open `.view.xml` and `.fragment.xml` documents
 *
 * @returns void
 */
const validateOpenDocuments = async (): Promise<void> => {
  const allDocuments = documents.all();
  for (const document of allDocuments) {
    const documentPath = URI.parse(document.uri).fsPath;
    const context = await getContext(
      documentPath,
      initializationOptions?.modelCachePath
    );
    if (!isContext(context)) {
      handleContextError(context);
      return;
    }
    const diagnostics = getXMLViewDiagnostics({
      document,
      context,
    });
    documentsDiagnostics.set(document.uri, diagnostics);
    getLogger().trace("computed diagnostics", {
      diagnostics,
    });
    connection.sendDiagnostics({ uri: document.uri, diagnostics });
  }
};
/**
 * Validate ids for all open `.view.xml` and `.fragment.xml` documents
 *
 * @returns void
 */
const validateIdsOfOpenDocuments = async (): Promise<void> => {
  const allDocuments = documents.all();
  for (const document of allDocuments) {
    const documentPath = URI.parse(document.uri).fsPath;
    const context = await getContext(
      documentPath,
      initializationOptions?.modelCachePath
    );
    if (!isContext(context)) {
      handleContextError(context);
      return;
    }
    const idDiagnostics = getXMLViewIdDiagnostics({
      document,
      context,
    });
    let diagnostics = documentsDiagnostics.get(document.uri) ?? [];
    diagnostics = diagnostics.concat(idDiagnostics);

    getLogger().trace("computed diagnostics", {
      diagnostics,
    });
    connection.sendDiagnostics({ uri: document.uri, diagnostics });
  }
};
/**
 * Validates the IDs of the open document and sends the diagnostics to the client
 * @param {TextDocument} document - The open document to be validated
 * @param {Context} context - The context containing additional information
 * @returns {void}
 */
const validateIdsOfOpenDocument = (
  document: TextDocument,
  context: Context
): void => {
  const idDiagnostics = getXMLViewIdDiagnostics({
    document,
    context,
  });
  let diagnostics = documentsDiagnostics.get(document.uri) ?? [];
  diagnostics = diagnostics.concat(idDiagnostics);

  getLogger().trace("computed diagnostics", {
    diagnostics,
  });
  connection.sendDiagnostics({ uri: document.uri, diagnostics });
};

async function validateOpenDocumentsOnDidChangeWatchedFiles(
  changes: FileEvent[]
): Promise<void> {
  const supportedDocs = [
    "manifest.json",
    "ui5.yaml",
    ".cds",
    ".xml",
    "package.json",
  ];

  const found = changes.find(
    (change) =>
      !isXMLView(change.uri) &&
      supportedDocs.find((doc) => change.uri.endsWith(doc))
  );
  if (!found) {
    return;
  }
  await validateOpenDocuments();
  await validateIdsOfOpenDocuments();
}

connection.onDidChangeWatchedFiles(async (changeEvent): Promise<void> => {
  try {
    getLogger().debug("`onDidChangeWatchedFiles` event", {
      changeEvent,
    });
    const cdsFileEvents: FileEvent[] = [];
    for (const change of changeEvent.changes) {
      const uri = change.uri;
      if (uri.endsWith("manifest.json")) {
        const manifestVersion = await getManifestVersion({
          manifestUri: uri,
          changeType: change.type,
        });
        if (manifestVersion.changed) {
          // notify client
          connection.sendNotification(
            "UI5LanguageAssistant/manifestVersionChanged",
            {
              ...manifestVersion,
            }
          );
        }
        await reactOnManifestChange(uri, change.type);
      } else if (uri.endsWith("ui5.yaml")) {
        await reactOnUI5YamlChange(uri, change.type);
      } else if (uri.endsWith(".cds")) {
        cdsFileEvents.push(change);
      } else if (uri.endsWith(".xml")) {
        await reactOnXmlFileChange(uri, change.type);
        await reactOnViewFileChange(
          uri,
          change.type,
          validateIdsOfOpenDocuments
        );
      } else if (uri.endsWith("package.json")) {
        await reactOnPackageJson(uri, change.type);
      }
    }
    await reactOnCdsFileChange(cdsFileEvents);
    await validateOpenDocumentsOnDidChangeWatchedFiles(changeEvent.changes);
  } catch (error) {
    getLogger().error("`onDidChangeWatchedFiles` failed:", error);
  }
});

documents.onDidChangeContent(async (changeEvent): Promise<void> => {
  try {
    getLogger().trace("`onDidChangeContent` event", {
      ...changeEvent.document,
    });
    if (
      manifestStateInitialized === undefined ||
      ui5yamlStateInitialized === undefined ||
      !isXMLView(changeEvent.document.uri)
    ) {
      return;
    }

    await Promise.all([manifestStateInitialized, ui5yamlStateInitialized]);
    const documentUri = changeEvent.document.uri;
    const document = documents.get(documentUri);
    if (document !== undefined) {
      const documentPath = URI.parse(documentUri).fsPath;
      const context = await getContext(
        documentPath,
        initializationOptions?.modelCachePath,
        document.getText()
      );
      if (!isContext(context)) {
        handleContextError(context);
        return;
      }

      const version = context.ui5Model.version;
      const framework = context.yamlDetails.framework;
      const isFallback = context.ui5Model.isFallback;
      const isIncorrectVersion = context.ui5Model.isIncorrectVersion;
      const url = await getCDNBaseUrl(framework, version);
      connection.sendNotification("UI5LanguageAssistant/ui5Model", {
        url,
        framework,
        version,
        isFallback,
        isIncorrectVersion,
      });
      const diagnostics = getXMLViewDiagnostics({
        document,
        context,
      });
      documentsDiagnostics.set(document.uri, diagnostics);
      const settings = getConfigurationSettings();
      const limitUniqueIdsDiagReport = settings.LimitUniqueIdDiagnostics;
      if (limitUniqueIdsDiagReport) {
        validateIdsOfOpenDocument(document, context);
      } else {
        await validateIdsOfOpenDocuments();
      }
    }
  } catch (error) {
    getLogger().error("`onDidChangeContent` failed:", error);
  }
});

connection.onCodeAction(async (params) => {
  try {
    getLogger().debug("`onCodeAction` event", { params });

    const docUri = params.textDocument.uri;
    const textDocument = documents.get(docUri);
    if (textDocument === undefined) {
      return;
    }

    const documentPath = URI.parse(docUri).fsPath;
    const context = await getContext(
      documentPath,
      initializationOptions?.modelCachePath,
      textDocument.getText()
    );
    if (!isContext(context)) {
      handleContextError(context);
      return;
    }

    const version = context.ui5Model.version;
    const framework = context.yamlDetails.framework;
    const isFallback = context.ui5Model.isFallback;
    const isIncorrectVersion = context.ui5Model.isIncorrectVersion;
    const url = await getCDNBaseUrl(framework, version);
    connection.sendNotification("UI5LanguageAssistant/ui5Model", {
      url,
      framework,
      version,
      isFallback,
      isIncorrectVersion,
    });

    const diagnostics = params.context.diagnostics;
    const codeActions = diagnosticToCodeActionFix(
      textDocument,
      diagnostics,
      context
    );
    getLogger().trace("`computed codeActions", { codeActions });
    return codeActions;
  } catch (error) {
    getLogger().error("`onCodeAction` failed:", error);
  }
});

connection.onExecuteCommand(async (params) => {
  try {
    getLogger().debug("`onExecuteCommand` event", { params });
    executeCommand(connection, params);
  } catch (error) {
    getLogger().error("`onExecuteCommand` failed:", error);
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
    getLogger().debug("updating settings for document", { result });
    setSettingsForDocument(resource, result);
  }
}

connection.onDidChangeConfiguration(async (change) => {
  try {
    getLogger().debug("`onDidChangeConfiguration` event");
    if (hasConfigurationCapability) {
      getLogger().trace("Reset all cached document settings");
      clearSettings();
    } else {
      if (change.settings.UI5LanguageAssistant !== undefined) {
        const ui5LangAssistSettings = change.settings.UI5LanguageAssistant;
        getLogger().trace("Set global settings", {
          ui5LangAssistSettings,
        });
        setGlobalSettings(ui5LangAssistSettings);
      }
    }
    if (change.settings.UI5LanguageAssistant !== undefined) {
      const ui5LangAssistSettings = change.settings.UI5LanguageAssistant;
      getLogger().trace("Set configuration settings", {
        ui5LangAssistSettings,
      });
      setConfigurationSettings(ui5LangAssistSettings);
    }
    // re-validate the files related to the `cached document settings`.
    await validateIdsOfOpenDocuments();
    // `setLogLevel` will ignore `undefined` values
    setLogLevel(change?.settings?.UI5LanguageAssistant?.logging?.level);
  } catch (error) {
    getLogger().error("`onDidChangeConfiguration` failed:", error);
  }
});

// Only keep settings for open documents
documents.onDidClose((textDocumentChangeEvent) => {
  getLogger().debug("`onDidClose` event", {
    document: textDocumentChangeEvent.document,
  });
  const uri = textDocumentChangeEvent.document.uri;
  if (isXMLView(uri)) {
    // clear diagnostics for a closed file
    connection.sendDiagnostics({ uri, diagnostics: [] });
    documentsDiagnostics.delete(uri);
  }
  clearDocumentSettings(uri);
});

documents.listen(connection);

connection.listen();

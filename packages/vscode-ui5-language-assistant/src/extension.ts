/* istanbul ignore file */
import { resolve } from "path";
import { readFileSync } from "fs";
import {
  workspace,
  ExtensionContext,
  StatusBarItem,
  window,
  StatusBarAlignment,
  commands,
  env,
  Uri,
  languages,
  TextDocument,
  TextEdit,
} from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";
import { LogLevel } from "@vscode-logging/types";
import {
  SERVER_PATH,
  ServerInitializationOptions,
} from "@ui5-language-assistant/language-server";
import {
  COMMAND_OPEN_DEMOKIT,
  LOGGING_LEVEL_CONFIG_PROP,
  MANIFEST_SCHEMA,
} from "./constants";
import { getManifestSchemaProvider } from "./manifest-schema-provider";
import {
  getLocalUrl,
  tryFetch,
  isXMLView,
} from "@ui5-language-assistant/logic-utils";
import { formatDocument, formatRange } from "./formatter";
import {
  bindingLegend,
  bindingSemanticTokensProvider,
} from "./binding-semantic-token-provider";

type UI5Model = {
  url: string;
  framework: string;
  version: string;
  isFallback: boolean;
  isIncorrectVersion?: boolean;
};

let client: LanguageClient;
let statusBarItem: StatusBarItem;
let currentModel: UI5Model | undefined;

function init(context: ExtensionContext): void {
  // create the StatusBarItem which displays the used UI5 version
  statusBarItem = createStatusBarItem(context);

  // create the LanguageClient (+Server)
  client = createLanguageClient(context);

  client.start().then(() => {
    // show/hide and update the status bar
    client.onNotification(
      "UI5LanguageAssistant/ui5Model",
      async (model: UI5Model): Promise<void> => await updateCurrentModel(model)
    );
    client.onNotification(
      "UI5LanguageAssistant/context-error",
      (error: Error) => handleContextError(error)
    );
  });
}

export async function activate(context: ExtensionContext): Promise<void> {
  // complete initialization task asynchronously
  init(context);

  // register semantic token provider
  context.subscriptions.push(
    languages.registerDocumentSemanticTokensProvider(
      { language: "xml" },
      bindingSemanticTokensProvider,
      bindingLegend
    )
  );

  window.onDidChangeActiveTextEditor(async () => {
    await updateCurrentModel(undefined);
  });

  context.subscriptions.push(
    languages.registerDocumentFormattingEditProvider("xml", {
      provideDocumentFormattingEdits(document: TextDocument): TextEdit[] {
        if (isXMLView(document.uri.fsPath)) {
          return formatDocument(document);
        }
        return [];
      },
    })
  );

  context.subscriptions.push(
    languages.registerDocumentRangeFormattingEditProvider("xml", {
      provideDocumentRangeFormattingEdits(
        document,
        range,
        options
      ): TextEdit[] {
        if (isXMLView(document.uri.fsPath)) {
          return formatRange(document, range, options);
        }
        return [];
      },
    })
  );

  context.subscriptions.push(
    workspace.registerTextDocumentContentProvider(
      MANIFEST_SCHEMA,
      await getManifestSchemaProvider(context)
    )
  );
}

function createLanguageClient(context: ExtensionContext): LanguageClient {
  const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };

  const serverOptions: ServerOptions = {
    run: { module: SERVER_PATH, transport: TransportKind.ipc },
    debug: {
      module: SERVER_PATH,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  };

  const meta = JSON.parse(
    readFileSync(resolve(context.extensionPath, "package.json"), "utf8")
  );

  const logLevel = workspace.getConfiguration().get(LOGGING_LEVEL_CONFIG_PROP);

  const initializationOptions: ServerInitializationOptions = {
    modelCachePath: context.globalStoragePath,
    publisher: meta.publisher,
    name: meta.name,
    // validation of the logLevel value is done on the language server process.
    logLevel: logLevel as LogLevel,
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", pattern: "**/*.{view,fragment}.xml" }],
    synchronize: {
      fileEvents: [
        workspace.createFileSystemWatcher("**/manifest.json"),
        workspace.createFileSystemWatcher("**/ui5.yaml"),
        workspace.createFileSystemWatcher("**/*.xml"),
        workspace.createFileSystemWatcher("**/*.cds"),
        workspace.createFileSystemWatcher("**/package.json"),
      ],
    },
    outputChannelName: meta.displayName,
    initializationOptions: initializationOptions,
  };

  return new LanguageClient(
    "UI5LanguageAssistant",
    "UI5 Language Assistant",
    serverOptions,
    clientOptions
  );
}

function createStatusBarItem(context: ExtensionContext): StatusBarItem {
  // create and register the command to open the SAPUI5 demokit
  context.subscriptions.push(
    commands.registerCommand(COMMAND_OPEN_DEMOKIT, () => {
      env.openExternal(Uri.parse(`${currentModel?.url}`));
    })
  );

  // create a statusbar item to display the currently used UI5 version
  statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 100);
  statusBarItem.command = COMMAND_OPEN_DEMOKIT;
  return statusBarItem;
}

async function updateCurrentModel(model: UI5Model | undefined): Promise<void> {
  currentModel = model;
  if (statusBarItem) {
    if (currentModel) {
      let tooltipText = `${currentModel.framework} Version (XMLView Editor)`;
      let version = currentModel.version;
      if (currentModel.isFallback) {
        tooltipText += ` minUI5 version not found in manifest.json. Fallback to UI5 ${currentModel.version}`;
        version = `Fallback: ${currentModel.version}`;
      }

      if (currentModel.isIncorrectVersion) {
        tooltipText += ` minUI5 version found in manifest.json is out of maintenance or not supported by UI5 Language Assistant. Using fallback to UI5 ${currentModel.version}.`;
        version = `Fallback: ${currentModel.version}`;
      }
      const localUrl = getLocalUrl(
        version,
        workspace.getConfiguration().get("UI5LanguageAssistant")
      );
      if (localUrl) {
        const response = await tryFetch(localUrl);
        if (response) {
          version = `${version} (local)`;
          tooltipText =
            "Alternative (local) SAP UI5 web server is defined in user or workspace settings. Using SAP UI5 version fetched from the local server";
        }
      }
      statusBarItem.tooltip = tooltipText;
      statusBarItem.text = `$(notebook-mimetype)  ${version}${
        currentModel.framework === "OpenUI5" ? "'" : ""
      }`;
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  }
}

let showedOnce = false;
function handleContextError(error: Error & { code?: string }) {
  if (showedOnce) {
    return;
  }
  showedOnce = true;
  if (error.code) {
    window.showErrorMessage(
      "[SAP UI5 SDK](https://tools.hana.ondemand.com/#sapui5) is not accessible. Connect to the internet or setup local web server for offline work."
    );
  } else {
    window.showErrorMessage(
      "An error has occurred building context. Please open an [issue](https://github.com/SAP/ui5-language-assistant/issues)"
    );
  }
}

export async function deactivate(): Promise<Thenable<void>> {
  if (!client) {
    return undefined;
  }
  await updateCurrentModel(undefined);
  return client.stop();
}

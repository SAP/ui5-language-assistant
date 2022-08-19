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
} from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient";
import { LogLevel } from "@vscode-logging/types";
import {
  SERVER_PATH,
  ServerInitializationOptions,
} from "@ui5-language-assistant/language-server";
import { COMMAND_OPEN_DEMOKIT, LOGGING_LEVEL_CONFIG_PROP } from "./constants";

let client: LanguageClient;
let statusBarItem: StatusBarItem;
let currentVersion: string | undefined;

export async function activate(context: ExtensionContext): Promise<void> {
  // create the LanguageClient (+Server)
  client = createLanguageClient(context);

  // create the StatusBarItem which displays the used UI5 version
  statusBarItem = createStatusBarItem(context);

  // show/hide and update the status bar
  client.onReady().then(() => {
    client.onNotification("UI5LanguageAssistant/ui5Model", (version: string) =>
      updateCurrentVersion(version)
    );
  });
  window.onDidChangeActiveTextEditor(() => {
    updateCurrentVersion(undefined);
  });

  client.start();
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
      fileEvents: [workspace.createFileSystemWatcher("**/manifest.json")],
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
      env.openExternal(Uri.parse(`https://ui5.sap.com/${currentVersion}/`));
    })
  );

  // create a statusbar item to display the currently used UI5 version
  statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 100);
  statusBarItem.tooltip = "UI5 Version (XML Editor)";
  statusBarItem.command = COMMAND_OPEN_DEMOKIT;
  return statusBarItem;
}

function updateCurrentVersion(version: string | undefined) {
  currentVersion = version;
  if (statusBarItem) {
    if (version) {
      statusBarItem.text = `$(notebook-mimetype) ${version}`;
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  }
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  updateCurrentVersion(undefined);
  return client.stop();
}

/* istanbul ignore file */
import { resolve } from "path";
import { URL } from "url";
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
  WebviewPanel,
  ViewColumn,
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
import {
  COMMAND_OPEN_DEMOKIT,
  COMMAND_OPEN_WEBVIEW,
  LOGGING_LEVEL_CONFIG_PROP,
  REPLACE_GO_TO_DEFINITION,
} from "./constants";
import { utils } from "./util";

type UI5Model = { url: string; framework: string; version: string };

let client: LanguageClient;
let statusBarItem: StatusBarItem;
let currentModel: UI5Model | undefined;
let currentPanel: WebviewPanel | undefined;
let context: ExtensionContext | undefined;
export async function activate(context: ExtensionContext): Promise<void> {
  // create the LanguageClient (+Server)
  client = createLanguageClient(context);
  context = context;
  // create the StatusBarItem which displays the used UI5 version
  statusBarItem = createStatusBarItem(context);
  createWebView(context);

  // show/hide and update the status bar
  client.onReady().then(() => {
    client.onNotification(
      "UI5LanguageAssistant/ui5Model",
      (model: UI5Model) => {
        updateCurrentModel(model);
      }
    );

    client.onNotification(
      "UI5LanguageAssistant/ui5Definition",
      (model: UI5Model) => {
        showWebView();
      }
    );
  });
  window.onDidChangeActiveTextEditor(() => {
    updateCurrentModel(undefined);
  });

  client.start();
}

function createLanguageClient(context: ExtensionContext): LanguageClient {
  const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };
  console.log(SERVER_PATH);
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

function updateCurrentModel(model: UI5Model | undefined) {
  currentModel = model;
  if (statusBarItem) {
    if (currentModel) {
      statusBarItem.tooltip = `${currentModel.framework} Version (XMLView Editor)`;
      statusBarItem.text = `$(notebook-mimetype) ${currentModel.version}${
        currentModel.framework === "OpenUI5" ? "'" : ""
      }`;
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  }
}

function createWebView(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(COMMAND_OPEN_WEBVIEW, showWebView)
  );
  context.subscriptions.push(
    commands.registerCommand(REPLACE_GO_TO_DEFINITION, showWebView)
  );
}

function showWebView() {
  const columnToShowIn = window.activeTextEditor
    ? window.activeTextEditor.viewColumn! + 1
    : ViewColumn.One;
  const control = new utils().findControl(window.activeTextEditor);
  const ui5Url = `${new URL(currentModel!.url).href}${
    control ? "#/api/" + control : ""
  }`;

  const createWebView = () => {
    currentPanel = window.createWebviewPanel(
      "ui5APIRef",
      "UI5 API Reference",
      columnToShowIn,
      {
        enableScripts: true,
      }
    );
    currentPanel.webview.html = getWebviewContent(ui5Url);

    // Reset when the current panel is closed
    currentPanel.onDidDispose(
      () => {
        currentPanel = undefined;
      },
      null,
      context!.subscriptions
    );
  };
  if (currentPanel) {
    // If the panel is disposed, then create a new one.
    try {
      currentPanel.webview.postMessage({ url: ui5Url });

      currentPanel.reveal(columnToShowIn);
    } catch (error) {
      currentPanel = undefined;
      // Otherwise, create a new panel.
      createWebView();
    }
  } else {
    createWebView();
  }
}

function getWebviewContent(ui5Url: string) {
  //Check if we are in a tag

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script>
       
        // Handle the message inside the webview
        window.addEventListener('message', event => {
            const message = event.data; // The JSON data our extension sent
            document.getElementById('myFrame').src = message.url;
        });
    </script>
  </head>
  <body style="margin:0px;padding:0px;overflow:hidden">
      <iframe id="myFrame" frameborder="0" style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100%;width:100%;position:absolute;top:0px;left:0px;right:0px;bottom:0px" height="100%" width="100%" src="${ui5Url}"></iframe>
  </body>
  </html>`;
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  updateCurrentModel(undefined);
  return client.stop();
}

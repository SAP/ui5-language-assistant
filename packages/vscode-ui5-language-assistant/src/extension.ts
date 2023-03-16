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
  OverviewRulerLane,
  DecorationOptions,
  Range,
  DecorationRangeBehavior,
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
import { COMMAND_OPEN_DEMOKIT, LOGGING_LEVEL_CONFIG_PROP } from "./constants";

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

export async function activate(context: ExtensionContext): Promise<void> {
  // create the LanguageClient (+Server)
  client = createLanguageClient(context);

  // create the StatusBarItem which displays the used UI5 version
  statusBarItem = createStatusBarItem(context);

  // show/hide and update the status bar
  client.start().then(() => {
    client.onNotification("UI5LanguageAssistant/ui5Model", (model: UI5Model) =>
      updateCurrentModel(model)
    );
  });
  window.onDidChangeActiveTextEditor(() => {
    updateCurrentModel(undefined);
  });
  textDecorator(context);
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

function updateCurrentModel(model: UI5Model | undefined) {
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

function textDecorator(context: ExtensionContext): void {
  let timeout: NodeJS.Timer | undefined = undefined;

  // create a decorator type that we use to decorate small numbers
  const InlineIconDecoration = window.createTextEditorDecorationType({
    textDecoration: "none; opacity: 0.6 !important;",
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  });

  const HideTextDecoration = window.createTextEditorDecorationType({
    textDecoration: "none; display: none;", // a hack to inject custom style
  });

  let activeEditor = window.activeTextEditor;

  function updateDecorations() {
    if (!activeEditor) {
      return;
    }
    const regEx = /sap-icon:\/\/(\w+)/g;
    const text = activeEditor.document.getText();
    const decoratirOptions: DecorationOptions[] = [];
    let match;
    while ((match = regEx.exec(text))) {
      const startPos = activeEditor.document.positionAt(match.index);
      const endPos = activeEditor.document.positionAt(
        match.index + match[0].length
      );
      const item: DecorationOptions = {
        range: new Range(startPos, endPos),
        renderOptions: {
          before: {
            fontStyle: "SAP-icons",
            contentText: "",
          },
        },
        hoverMessage: "",
      };

      decoratirOptions.push(item);
    }
    activeEditor.setDecorations(InlineIconDecoration, decoratirOptions);
    activeEditor.setDecorations(
      HideTextDecoration,
      decoratirOptions
        .map(({ range }) => range)
        .filter((i) => i.start.line !== activeEditor!.selection.start.line)
    );
  }

  function triggerUpdateDecorations(throttle = false) {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
    if (throttle) {
      timeout = setTimeout(updateDecorations, 500);
    } else {
      updateDecorations();
    }
  }

  if (activeEditor) {
    triggerUpdateDecorations();
  }

  window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor;
      if (editor) {
        triggerUpdateDecorations();
      }
    },
    null,
    context.subscriptions
  );

  workspace.onDidChangeTextDocument(
    (event) => {
      if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateDecorations(true);
      }
    },
    null,
    context.subscriptions
  );
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  updateCurrentModel(undefined);
  return client.stop();
}

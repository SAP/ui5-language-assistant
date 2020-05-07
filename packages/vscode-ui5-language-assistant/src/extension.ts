/* istanbul ignore file */
import { workspace, window } from "vscode";
import {
  SERVER_PATH,
  ServerInitializationOptions,
} from "@ui5-language-assistant/language-server";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient";
import { ExtensionContext } from "vscode";

let client: LanguageClient;

export async function activate(context: ExtensionContext): Promise<void> {
  // TODO: read name from package.json
  const channel = window.createOutputChannel("UI5 Language Assistant");

  const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };

  const serverOptions: ServerOptions = {
    run: { module: SERVER_PATH, transport: TransportKind.ipc },
    debug: {
      module: SERVER_PATH,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  };

  const initializationOptions: ServerInitializationOptions = {
    modelCachePath: context.globalStoragePath,
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", pattern: "**/*.{view,fragment}.xml" }],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher("**/*.{view,fragment}.xml"),
    },
    // Sending a channel we created instead of only giving it a name in outputChannelName so that if necessary we
    // can print to it before the client starts (in this method)
    outputChannel: channel,
    initializationOptions: initializationOptions,
  };

  client = new LanguageClient(
    "UI5LanguageAssistant",
    "UI5 Language Assistant",
    serverOptions,
    clientOptions
  );

  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}

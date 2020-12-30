/* istanbul ignore file */
import { resolve } from "path";
import { readFileSync } from "fs";
import { workspace, ExtensionContext } from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient";
import {
  SERVER_PATH,
  ServerInitializationOptions,
} from "@ui5-language-assistant/language-server";
import { listenToLogLevelChanges } from "./configuration";

let client: LanguageClient;

export async function activate(context: ExtensionContext): Promise<void> {
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
  const initializationOptions: ServerInitializationOptions = {
    modelCachePath: context.globalStoragePath,
    publisher: meta.publisher,
    name: meta.name,
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", pattern: "**/*.{view,fragment}.xml" }],
    synchronize: {
      fileEvents: [workspace.createFileSystemWatcher("**/manifest.json")],
    },
    // TODO: test what would have been the default name?
    outputChannelName: meta.name,
    initializationOptions: initializationOptions,
  };

  client = new LanguageClient(
    "UI5LanguageAssistant",
    "UI5 Language Assistant",
    serverOptions,
    clientOptions
  );

  listenToLogLevelChanges({
    subscriptions: context.subscriptions,
    sendRequest: client.sendRequest,
    getConfiguration: workspace.getConfiguration,
    onDidChangeConfiguration: workspace.onDidChangeConfiguration,
  });
  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}

/* istanbul ignore file */
import { workspace, window } from "vscode";
import { SERVER_PATH } from "@ui5-editor-tools/language-server";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from "vscode-languageclient";

let client: LanguageClient;

export async function activate(): Promise<void> {
  const channel = window.createOutputChannel("UI5 Editor Tools");

  //TODO add context: vscode.ExtensionContext parameter and use context.globalStoragePath to store the api.json files

  const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };

  const serverOptions: ServerOptions = {
    run: { module: SERVER_PATH, transport: TransportKind.ipc },
    debug: {
      module: SERVER_PATH,
      transport: TransportKind.ipc,
      options: debugOptions
    }
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", pattern: "**/*.{view,fragment}.xml" }],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher("**/*.{view,fragment}.xml")
    },
    // Sending a channel we created instead of only giving it a name in outputChannelName so that if necessary we
    // can print to it before the client starts (in this method)
    outputChannel: channel
  };

  client = new LanguageClient(
    "UI5EditorTools",
    "UI5 Editor Tools",
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

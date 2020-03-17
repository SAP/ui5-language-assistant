import { workspace } from "vscode";
import { SERVER_PATH } from "@vscode-ui5/language-server";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from "vscode-languageclient";

let client: LanguageClient;

export async function activate(): Promise<void> {
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
    documentSelector: [{ scheme: "file", language: "xml" }],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher("**/*.{view,fragment}.xml")
    }
  };

  client = new LanguageClient(
    "LanguageClient",
    "Language Client",
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

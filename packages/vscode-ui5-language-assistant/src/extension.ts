/* istanbul ignore file */
import {
  workspace,
  window,
  WorkspaceConfiguration,
  ExtensionContext,
} from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient";
import { isArray, find, some } from "lodash";
import {
  SERVER_PATH,
  ServerInitializationOptions,
} from "@ui5-language-assistant/language-server";

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

  const jsonSchemaConfig:
    | WorkspaceConfiguration
    | undefined = workspace.getConfiguration().get("json.schemas");
  if (
    process.env["THEIA_PARENT_PID"] !== undefined &&
    isArray(jsonSchemaConfig)
  ) {
    const providedManifestSchemaConfigs = find(jsonSchemaConfig, (_) => {
      return some(
        _.fileMatch,
        (fileMatchEntry) => fileMatchEntry === "manifest.json"
      );
    });

    if (providedManifestSchemaConfigs === undefined) {
      const manifestSchemaConfig = {
        fileMatch: ["manifest.json"],
        url:
          "https://cdn.jsdelivr.net/gh/SAP/ui5-language-assistant/packages/vscode-ui5-language-assistant/resources/manifest-schema/rel-1.19/schema/schema.json",
      };

      jsonSchemaConfig.push(manifestSchemaConfig);
      workspace
        .getConfiguration()
        .update("json.schemas", jsonSchemaConfig, true);
    }
  }

  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}

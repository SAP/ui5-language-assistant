import {
  ConfigurationChangeEvent,
  Event,
  ExtensionContext,
  WorkspaceConfiguration,
} from "vscode";
import { LanguageClient } from "vscode-languageclient";

export const LOGGING_LEVEL_CONFIG_PROP = "UI5LanguageAssistant.logging.level";

export function listenToLogLevelChanges(opts: {
  context: ExtensionContext;
  client: LanguageClient;
  onDidChangeConfiguration: Event<ConfigurationChangeEvent>;
  getConfiguration: (section?: string) => WorkspaceConfiguration;
}): void {
  opts.context.subscriptions.push(
    opts.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(LOGGING_LEVEL_CONFIG_PROP)) {
        const newLogLevel = opts
          .getConfiguration()
          .get(LOGGING_LEVEL_CONFIG_PROP);
        // no validation done here as the server performs such validation
        // and will ignore invalid values.
        opts.client.sendRequest("changeLogLevel", newLogLevel);
      }
    })
  );
}

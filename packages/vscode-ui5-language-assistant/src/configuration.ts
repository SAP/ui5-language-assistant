import {
  ConfigurationChangeEvent,
  Event,
  WorkspaceConfiguration,
} from "vscode";
import { CHANGE_LOG_LEVEL_REQUEST } from "@ui5-language-assistant/language-server";

export const LOGGING_LEVEL_CONFIG_PROP = "UI5LanguageAssistant.logging.level";

export function listenToLogLevelChanges<R>(opts: {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- signature with `any` originates from VSCode APIs */
  subscriptions: { dispose(): any }[];
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- signature with `any` originates from VSCode APIs */
  sendRequest: (method: string, param: any) => Promise<R>;
  onDidChangeConfiguration: Event<ConfigurationChangeEvent>;
  getConfiguration: (section?: string) => WorkspaceConfiguration;
}): void {
  opts.subscriptions.push(
    opts.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(LOGGING_LEVEL_CONFIG_PROP)) {
        const newLogLevel = opts
          .getConfiguration()
          .get(LOGGING_LEVEL_CONFIG_PROP);
        // no validation done here as the server performs such validation
        // and will ignore invalid values.
        opts.sendRequest(CHANGE_LOG_LEVEL_REQUEST, newLogLevel);
      }
    })
  );
}

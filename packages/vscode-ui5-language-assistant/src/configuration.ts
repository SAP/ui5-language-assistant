import { ExtensionContext, workspace } from "vscode";
import { LanguageClient } from "vscode-languageclient";

// TODO: can we get this from meta?
// TODO: or do we just verify this in a test?
export const LOGGING_LEVEL_CONFIG_PROP = "UI5LanguageAssistant.logging.level";

export function listenToLogLevelChanges(
  context: ExtensionContext,
  client: LanguageClient
): void {
  context.subscriptions.push(
    workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(LOGGING_LEVEL_CONFIG_PROP)) {
        const newLogLevel = workspace
          .getConfiguration()
          .get(LOGGING_LEVEL_CONFIG_PROP);
        // no validation done here as the server performs such validation
        // and will ignore invalid values.
        client.sendRequest("changeLogLevel", newLogLevel);
      }
    })
  );
}

import { ExecuteCommandParams, createConnection } from "vscode-languageserver";
import { commands } from "@ui5-language-assistant/user-facing-text";
import {
  executeQuickFixStableIdCommand,
  executeQuickFixFileStableIdCommand,
  executeQuickFixHardcodedI18nStringCommand,
} from "./quick-fix";
import { track } from "./swa";

type LSPConnection = ReturnType<typeof createConnection>;

export function executeCommand(
  connection: LSPConnection,
  params: ExecuteCommandParams
): void {
  if (params.arguments === undefined) {
    return;
  }

  switch (params.command) {
    case commands.QUICK_FIX_STABLE_ID_ERROR.name: {
      const change = executeQuickFixStableIdCommand({
        // Assumption that this command has the following arguments.
        // We passed them when the command was created.
        documentUri: params.arguments[0],
        documentVersion: params.arguments[1],
        quickFixReplaceRange: params.arguments[2],
        quickFixNewText: params.arguments[3],
      });
      connection.workspace.applyEdit({
        documentChanges: change,
      });
      track("MANIFEST_STABLE_ID", "single");
      return;
    }
    case commands.QUICK_FIX_STABLE_ID_FILE_ERRORS.name: {
      const change = executeQuickFixFileStableIdCommand({
        documentUri: params.arguments[1],
        documentVersion: params.arguments[2],
        nonStableIdIssues: params.arguments[3],
      });
      connection.workspace.applyEdit({
        documentChanges: change,
      });
      track("MANIFEST_STABLE_ID", "multiple");
      return;
    }
    case commands.QUICK_FIX_HARDCODED_I18N_STRING_ERROR.name: {
      const change = executeQuickFixHardcodedI18nStringCommand({
        // Assumption that this command has the following arguments.
        // We passed them when the command was created.
        documentUri: params.arguments[0],
        documentVersion: params.arguments[1],
        quickFixReplaceRange: params.arguments[2],
        quickFixNewText: params.arguments[3],
      });
      connection.workspace.applyEdit({
        documentChanges: change,
      });
      track("MANIFEST_HARDCODED_I18N_STRING", "single");
      return;
    }
    default:
      return undefined;
  }
}

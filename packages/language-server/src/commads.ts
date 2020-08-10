import { ExecuteCommandParams, createConnection } from "vscode-languageserver";
import {
  QUICK_FIX_STABLE_ID_COMMAND,
  executeQuickFixStableIdCommand,
  QUICK_FIX_FILE_STABLE_ID_COMMAND,
  executeQuickFixFIleStableIdCommand,
} from "./quick-fix";

type LSPConnection = ReturnType<typeof createConnection>;

export function executeCommand(
  connection: LSPConnection,
  params: ExecuteCommandParams
): void {
  if (params.arguments === undefined) {
    return;
  }

  switch (params.command) {
    case QUICK_FIX_STABLE_ID_COMMAND: {
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
      return;
    }
    case QUICK_FIX_FILE_STABLE_ID_COMMAND: {
      const change = executeQuickFixFIleStableIdCommand({
        document: params.arguments[0],
        documentUri: params.arguments[1],
        documentVersion: params.arguments[2],
        nonStableIdIssues: params.arguments[3],
      });
      connection.workspace.applyEdit({
        documentChanges: change,
      });
      return;
    }
    default:
      return undefined;
  }
}

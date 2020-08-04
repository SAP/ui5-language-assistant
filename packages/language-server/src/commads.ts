import { ExecuteCommandParams, createConnection } from "vscode-languageserver";
import {
  QUICK_FIX_STABLE_ID_COMMAND,
  executeQuickFixStableIdCommand,
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
        textDocument: params.arguments[0],
        quickFixReplaceRange: params.arguments[1],
        quickFixNewText: params.arguments[2],
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

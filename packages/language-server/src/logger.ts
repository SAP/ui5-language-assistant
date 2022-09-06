import {
  IChildLogger,
  IVSCodeExtLogger,
  LogLevel,
} from "@vscode-logging/types";
import { getExtensionLogger } from "@vscode-logging/logger";
import { validLoggingLevelValues } from "@ui5-language-assistant/settings";

// eslint-disable-next-line @typescript-eslint/no-var-requires -- Using `require` for .json file as this gets bundled with webpack correctly.
const meta = require("../package.json");

export type ILogger = Omit<IChildLogger, "getChildLogger">;

let logLevel: LogLevel = "error";
/**
 * We are using the VSCode Logging library right now as it is:
 * 1. The only one of our logging libraries available on npmjs.com (currently).
 * 2. Supports console logging which would be re-directed to the VSCode extension's output Channel
 *    - Assuming this LSP server processes was spawned from the VSCode Extension
 */
const loggerImpl: IVSCodeExtLogger = getExtensionLogger({
  extName: meta.name,
  level: logLevel,
  logConsole: true,
});

export function getLogger(): ILogger {
  return loggerImpl;
}

export function setLogLevel(newLevel: LogLevel): void {
  if (validLoggingLevelValues[newLevel]) {
    logLevel = newLevel;
    loggerImpl.changeLevel(newLevel);
  }
}

export function getLogLevel(): LogLevel {
  return logLevel;
}

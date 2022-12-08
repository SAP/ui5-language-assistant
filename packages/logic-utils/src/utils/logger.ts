import {
  IChildLogger,
  IVSCodeExtLogger,
  LogLevel,
} from "@vscode-logging/types";
import { getExtensionLogger } from "@vscode-logging/logger";
import { validLoggingLevelValues } from "@ui5-language-assistant/settings";

export type ILogger = Omit<IChildLogger, "getChildLogger">;
export { LogLevel } from "@vscode-logging/types";

let logLevel: LogLevel = "error";
/**
 * We are using the VSCode Logging library right now as it is:
 * 1. The only one of our logging libraries available on npmjs.com (currently).
 * 2. Supports console logging which would be re-directed to the VSCode extension's output Channel
 *    - Assuming this LSP server processes was spawned from the VSCode Extension
 */
const loggerImpl: Map<string, IVSCodeExtLogger> = new Map();

export function getLogger(extName: string): ILogger {
  let logger = loggerImpl.get(extName);
  if (!logger) {
    logger = getExtensionLogger({
      extName: extName,
      level: logLevel,
      logConsole: true,
    });
    loggerImpl.set(extName, logger);
  }
  return logger;
}

export function setLogLevel(extName: string, newLevel: LogLevel): void {
  const logger = loggerImpl.get(extName);
  if (validLoggingLevelValues[newLevel] && logger) {
    logLevel = newLevel;
    logger.changeLevel(newLevel);
  }
}

export function getLogLevel(): LogLevel {
  return logLevel;
}

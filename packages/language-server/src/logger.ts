import { cloneDeep, map } from "lodash";
import omitDeep from "omit-deep-lodash";
import { IChildLogger, IVSCodeExtLogger } from "@vscode-logging/types";
import { getExtensionLogger, LogLevel } from "@vscode-logging/logger";
import { validLoggingLevelValues } from "@ui5-language-assistant/settings";

// eslint-disable-next-line @typescript-eslint/no-var-requires -- Using `require` for .json file as this gets bundled with webpack correctly.
const meta = require("../../package.json");

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

function buildSafeLoggerMethod(
  methodName: LogLevel
): (msg: string, ...args: unknown[]) => void {
  return function (msg: string, ...args: unknown[]): void {
    const safeArgs = map(args, removePossibleUserInformation);
    loggerImpl[methodName].apply(loggerImpl, [msg, ...safeArgs]);
  };
}

const loggerWrapper: ILogger = {
  fatal: buildSafeLoggerMethod("fatal"),
  error: buildSafeLoggerMethod("error"),
  warn: buildSafeLoggerMethod("warn"),
  info: buildSafeLoggerMethod("info"),
  debug: buildSafeLoggerMethod("debug"),
  trace: buildSafeLoggerMethod("trace"),
};

export function getLogger(): ILogger {
  return loggerWrapper;
}

const possibleSensitiveProps = ["uri"];

export function setLogLevel(newLevel: LogLevel): void {
  if (validLoggingLevelValues[newLevel]) {
    logLevel = newLevel;
    loggerImpl.changeLevel(newLevel);
  }
}

export function getLogLevel(): LogLevel {
  return logLevel;
}

/**
 * Will create a **new** object that does not contain possible user information containing properties.
 * - Note this is **side effect free** and does not mutate the original param.
 *
 * @param obj - The target object from which to **recursively** remove properties that may contain user information.
 *
 * Note that the return type signature is does not describe the transformation.
 * It seems too much overhead to include these complex type signatures in our project
 * - see: https://stackoverflow.com/questions/55539387/deep-omit-with-typescript
 */
export function removePossibleUserInformation<
  T extends Record<string, unknown>
>(obj: T): T {
  const clonedObj = cloneDeep(obj);
  return omitDeep(clonedObj, possibleSensitiveProps) as T;
}

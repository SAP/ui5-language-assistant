import {
  getLogger as logger,
  setLogLevel as setLogLevelSetter,
  LogLevel,
  ILogger,
} from "@ui5-language-assistant/logic-utils";
import { join } from "path";
import { readJsonSync } from "fs-extra";
const getPackageName = (): string => {
  let meta;
  try {
    // in production - ../extensions/saposs.vscode-ui5-language-assistant-4.0.6/node_modules/@ui5-language-assistant/language-server/dist
    meta = readJsonSync(join(__dirname, "..", "package.json"));
  } catch (error) {
    meta = readJsonSync(join(__dirname, "..", "..", "package.json"));
  }
  return meta?.name;
};

const name = getPackageName();
export const getLogger = (): ILogger => {
  return logger(name);
};

export const setLogLevel = (logLevel: LogLevel): void =>
  setLogLevelSetter(name, logLevel);

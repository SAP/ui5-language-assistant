import {
  getLogger as logger,
  setLogLevel as setLogLevelSetter,
  LogLevel,
  ILogger,
} from "@ui5-language-assistant/logic-utils";

const getPackageName = (): string => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires -- Using `require` for .json file as this gets bundled with webpack correctly.
  const meta = require("../../package.json");
  return meta.name;
};

const name = getPackageName();
export const getLogger = (): ILogger => {
  return logger(name);
};

export const setLogLevel = (logLevel: LogLevel): void =>
  setLogLevelSetter(name, logLevel);

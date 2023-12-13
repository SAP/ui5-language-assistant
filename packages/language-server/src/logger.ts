import {
  getLogger as logger,
  setLogLevel as setLogLevelSetter,
  LogLevel,
  ILogger,
} from "@ui5-language-assistant/logger";
import { PACKAGE_NAME } from "./constant";

export const getLogger = (): ILogger => {
  return logger(PACKAGE_NAME);
};

export const setLogLevel = (logLevel: LogLevel): void =>
  setLogLevelSetter(PACKAGE_NAME, logLevel);

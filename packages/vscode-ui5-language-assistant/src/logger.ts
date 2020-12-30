// import { workspace } from "vscode";
// import { get, has, includes } from "lodash";
//
// const LOGGING_LEVEL_CONFIG_PROP = "UI5LanguageAssistant.loggingLevel";
// const LOGGING_LEVEL_CONFIG_PROP_FULL_PATH =
//   "contributes.configuration.properties." + LOGGING_LEVEL_CONFIG_PROP;
//
// export const LOGGING_LEVELS = [
//   "off",
//   "fatal",
//   "error",
//   "warn",
//   "info",
//   "debug",
//   "trace",
// ];
//
// export const DEFAULT_LOG_LEVEL = "error";
//
// function assertLoggingMetaData(meta: Record<string, unknown>): void {}
//
// export function getLogLevel(meta: Record<string, unknown>): string {
//   return "foo";
//   const configLoggingLevel = workspace
//     .getConfiguration()
//     .get(LOGGING_LEVEL_CONFIG_PROP);
//   // const possibleLogLevels = get(meta, LOGGING_LEVEL_CONFIG_PROP_FULL_PATH +".enum");
//   // const defaultLogLevel:unknown = get(meta, LOGGING_LEVEL_CONFIG_PROP_FULL_PATH +".default");
//   // const actualLoggingLevel = includes(possibleLogLevels, configLoggingLevel) ? configLoggingLevel : DEFAULT_LOG_LEVEL
// }

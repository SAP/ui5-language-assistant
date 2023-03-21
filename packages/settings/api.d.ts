export {
  getSettingsForDocument,
  hasSettingsForDocument,
  clearSettings,
  clearDocumentSettings,
  setGlobalSettings,
  getDefaultSettings,
  setSettingsForDocument,
  setConfigurationSettings,
  getConfigurationSettings,
} from "./src/api";
export type Settings = CodeAssistSettings &
  TraceSettings &
  LoggingSettings &
  WebServerSettings;

export interface WebServerSettings {
  SAPUI5WebServer?: string;
}

export interface CodeAssistSettings {
  codeAssist: {
    deprecated: boolean;
    experimental: boolean;
  };
}

export interface TraceSettings {
  trace: {
    server: keyof IValidTraceServerValues;
  };
}

export interface IValidTraceServerValues {
  off: true;
  messages: true;
  verbose: true;
}

export const validTraceServerValues: IValidTraceServerValues;

export interface LoggingSettings {
  logging: {
    level: keyof IValidLoggingLevelValues;
  };
}

export interface IValidLoggingLevelValues {
  off: true;
  fatal: true;
  error: true;
  warn: true;
  info: true;
  debug: true;
  trace: true;
}

export const validLoggingLevelValues: IValidLoggingLevelValues;

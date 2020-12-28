export type Settings = CodeAssistSettings & TraceSettings & LoggingSettings;

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

export function getSettingsForDocument(resource: string): Thenable<Settings>;

export function hasSettingsForDocument(resource: string): boolean;

export function setSettingsForDocument(
  resource: string,
  settings: Thenable<Settings>
): void;

export function clearSettings(): void;

export function clearDocumentSettings(resource: string): void;

export function setGlobalSettings(settings: Settings): void;

export function getDefaultSettings(): Settings;

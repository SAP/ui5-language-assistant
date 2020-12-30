export {
  setGlobalSettings,
  setSettingsForDocument,
  getSettingsForDocument,
  hasSettingsForDocument,
  clearSettings,
  clearDocumentSettings,
  getDefaultSettings,
} from "./settings";

export const validTraceServerValues = {
  off: true as const,
  messages: true as const,
  verbose: true as const,
};

export const validLoggingLevelValues = {
  off: true as const,
  fatal: true as const,
  error: true as const,
  warn: true as const,
  info: true as const,
  debug: true as const,
  trace: true as const,
};

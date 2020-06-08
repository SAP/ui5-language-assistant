export type Settings = CodeAssistSettings & TraceSettings;

export interface CodeAssistSettings {
  codeAssist: {
    deprecated: boolean;
    experimental: boolean;
  };
}

export interface TraceSettings {
  trace: {
    server: "off" | "messages" | "verbose";
  };
}

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

export interface Settings {
  codeAssist: {
    deprecated: boolean;
    experimental: boolean;
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

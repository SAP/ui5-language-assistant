import { init } from "./project";
import type { ExtensionAPI } from "@ui5-language-assistant/ui5-language-server-extension-types";
import {
  getCompletionItems as completionItems,
  getDiagnostics as diagnostics,
} from "./providers";

const api: ExtensionAPI = {
  getCompletionItems: completionItems,
  getDiagnostics: diagnostics,
  onDidChangeWatchedFiles: () => {
    return Promise.resolve();
  },
  initialize: (fileUri: string) => {
    return init(fileUri);
  },
};
const getCompletionItems = api.getCompletionItems;
const getDiagnostics = api.getDiagnostics;
const onDidChangeWatchedFiles = api.onDidChangeWatchedFiles;
const initialize = api.initialize;

export {
  getCompletionItems,
  getDiagnostics,
  onDidChangeWatchedFiles,
  initialize,
};

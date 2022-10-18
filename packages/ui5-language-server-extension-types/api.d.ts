import type { Diagnostic, CompletionItem } from "vscode-languageserver";
import type { DidChangeWatchedFilesParams } from "vscode-languageserver/node";
import type { IToken } from "chevrotain";
import type { XMLDocument } from "@xml-tools/ast";
import type { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import type { DocumentCstNode } from "@xml-tools/parser";
import type { Settings } from "@ui5-language-assistant/settings";
export interface ExtensionCompletionParams {
  documentPath: string;
  ui5Model: UI5SemanticModel;
  offset: number;
  cst: DocumentCstNode;
  ast: XMLDocument;
  tokenVector: IToken[];
  documentSettings: Settings;
}
export interface ExtensionDiagnosticParams {
  documentPath: string;
  ui5Model: UI5SemanticModel;
  ast: XMLDocument;
}

export interface ExtensionAPI {
  /**
   * Initialize and cache to avoid performance bottleneck
   */
  initialize: (fileUri: string) => Promise<void>;
  /**
   * Inform extensions about watched file changes
   */
  onDidChangeWatchedFiles: (
    params: DidChangeWatchedFilesParams
  ) => Promise<void>;
  /**
   * Provides completion items
   * @note gently handle exceptions and return empty array in case of exception
   */
  getCompletionItems: (
    params: ExtensionCompletionParams
  ) => Promise<CompletionItem[]>;
  /**
   * Provides diagnostics
   * @note gently handle exceptions and return empty array in case of exception
   */
  getDiagnostics: (params: ExtensionDiagnosticParams) => Promise<Diagnostic[]>;
}

/**
 * Absolute path to the server's "main" module
 * This is useful when launching the server in a separate process (e.g via spawn).
 */

import { LogLevel } from "@vscode-logging/types";
export declare const SERVER_PATH: string;

export type ServerInitializationOptions = {
  modelCachePath: string;
  /**
   * optional VSCode publisher name.
   */
  publisher?: string;
  /**
   * optional VSCode ext name.
   */
  name?: string;

  /**
   * Initial logging level for the language server.
   * The log level may be changed **after** the server has started
   * By sending a custom `changeLogLevel` LSP request
   */
  logLevel?: LogLevel;
};

export function getNodeName(
  text: string,
  offsetAt: number,
  cachePath?: string,
  framework?: string,
  ui5Version?: string
): Promise<string | undefined>;
export type FetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

export type Fetcher = (url: string) => Promise<FetchResponse>;

/**
 * Absolute path to the server's "main" module
 * This is useful when launching the server in a separate process (e.g via spawn).
 */
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
};

export type FetchResponse = {
  ok: boolean;
  json: () => Promise<unknown>;
};

export type Fetcher = (url: string) => Promise<FetchResponse>;

export type FetchResponse<T = unknown> = {
  ok: boolean;
  status: number;
  json: () => Promise<T>;
};

export type Fetcher<T = unknown> = (url: string) => Promise<FetchResponse<T>>;

export type VersionMapJsonType = Record<
  string,
  { version: string; support: string; lts: boolean }
>;

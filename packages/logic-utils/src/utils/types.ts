export type FetchResponse<T> = {
  ok: boolean;
  status: number;
  json: () => Promise<T>;
};

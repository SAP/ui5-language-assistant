export type FetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

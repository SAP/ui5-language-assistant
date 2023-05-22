import { Settings } from "@ui5-language-assistant/settings";

import * as fetchUtils from "../../src/utils/fetch";
import { tryFetch, getLocalUrl } from "../../src/api";

describe("fetch-helper", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe("localUrl", () => {
    it("check undefined", () => {
      const result = getLocalUrl();
      expect(result).toBeUndefined();
    });
    it("get local url without version [it adds forward slash]", () => {
      const result = getLocalUrl(undefined, {
        SAPUI5WebServer: "my.test.web.server",
      } as Settings);
      expect(result).toEqual("my.test.web.server/");
    });
    it("get local url without version", () => {
      const result = getLocalUrl(undefined, {
        SAPUI5WebServer: "my.test.web.server/",
      } as Settings);
      expect(result).toEqual("my.test.web.server/");
    });
    it("get local url with version", () => {
      const result = getLocalUrl("1.110.1", {
        SAPUI5WebServer: "my.test.web.server/",
      } as Settings);
      expect(result).toEqual("my.test.web.server/1.110.1/");
    });
  });
  describe("tryFetch", () => {
    it("check response", async () => {
      const fetchStub = jest
        .spyOn(fetchUtils, "fetch")
        .mockResolvedValue({ ok: true } as any);
      const result = await tryFetch("/abc");
      expect(fetchStub).toBeCalled();
      expect(result).toStrictEqual({ ok: true });
    });
    it("check undefined [response ok = false]", async () => {
      const fetchStub = jest.spyOn(fetchUtils, "fetch").mockResolvedValue({
        ok: false,
      } as any);
      const result = await tryFetch("/abc");
      expect(fetchStub).toBeCalled();
      expect(result).toBeUndefined();
    });
    it("check undefined [throw exception]", async () => {
      const result = await tryFetch("/dummy/uri");
      expect(result).toBeUndefined();
    });
  });
});

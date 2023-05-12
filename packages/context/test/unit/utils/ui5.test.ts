import * as logicUtils from "@ui5-language-assistant/logic-utils";
import { getCDNBaseUrl } from "../../../src/utils/ui5";
import { Response } from "node-fetch";

describe("ui5", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe("getCDNBaseUrl", () => {
    it("get CDN without local url [with version]", async () => {
      const result = await getCDNBaseUrl("SAPUI5", "1.111.0");
      expect(result).toEqual("https://ui5.sap.com/1.111.0/");
    });
    it("get CDN without local url [without version]", async () => {
      const result = await getCDNBaseUrl("SAPUI5", undefined);
      expect(result).toEqual("https://ui5.sap.com/");
    });
    it("get CDN with local url", async () => {
      const fakeGetLocalUrl = jest
        .spyOn(logicUtils, "getLocalUrl")
        .mockReturnValue("http://localhost:3000/1.111.0/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fakeTryFetch = jest
        .spyOn(logicUtils, "tryFetch")
        .mockResolvedValue({ ok: true } as unknown as Response);
      const result = await getCDNBaseUrl("SAPUI5", "1.111.0");
      expect(fakeGetLocalUrl).toHaveBeenCalled();
      expect(fakeTryFetch).toHaveBeenCalled();
      expect(result).toEqual("http://localhost:3000/1.111.0/");
    });
    it("get CDN with local url [fetch not responding => fall back to public]", async () => {
      const fakeGetLocalUrl = jest
        .spyOn(logicUtils, "getLocalUrl")
        .mockReturnValue("http://localhost:3000/1.112.0/");
      const fakeTryFetch = jest
        .spyOn(logicUtils, "tryFetch")
        .mockResolvedValue(undefined);
      const result = await getCDNBaseUrl("SAPUI5", "1.112.0");
      expect(fakeGetLocalUrl).toHaveBeenCalled();
      expect(fakeTryFetch).toHaveBeenCalled();
      expect(result).toEqual("https://ui5.sap.com/1.112.0/");
    });
  });
});

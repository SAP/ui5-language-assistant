import * as fetchHelper from "./../../src/utils/fetch-helper";
import {
  getCDNBaseUrl,
  getLibraryAPIJsonUrl,
  getVersionInfoUrl,
  getVersionJsonUrl,
  getVersionsMap,
} from "../../src/api";
import { Response } from "node-fetch";
import {
  DEFAULT_OPEN_UI5_VERSION,
  DEFAULT_UI5_FRAMEWORK,
  DEFAULT_UI5_VERSION,
  OPEN_FRAMEWORK,
} from "@ui5-language-assistant/constant";

describe("ui5", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe("getCDNBaseUrl", () => {
    it("get CDN without local url [with version]", async () => {
      const result = await getCDNBaseUrl(DEFAULT_UI5_FRAMEWORK, "1.111.0");
      expect(result).toEqual("https://ui5.sap.com/1.111.0/");
    });
    it("get CDN without local url [without version]", async () => {
      const result = await getCDNBaseUrl(DEFAULT_UI5_FRAMEWORK, undefined);
      expect(result).toEqual("https://ui5.sap.com/");
    });
    it("get CDN with local url", async () => {
      const fakeGetLocalUrl = jest
        .spyOn(fetchHelper, "getLocalUrl")
        .mockReturnValue("http://localhost:3000/1.111.0/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fakeTryFetch = jest
        .spyOn(fetchHelper, "tryFetch")
        .mockResolvedValue({ ok: true } as unknown as Response);
      const result = await getCDNBaseUrl(DEFAULT_UI5_FRAMEWORK, "1.111.0");
      expect(fakeGetLocalUrl).toHaveBeenCalled();
      expect(fakeTryFetch).toHaveBeenCalled();
      expect(result).toEqual("http://localhost:3000/1.111.0/");
    });
    it("get CDN with local url [fetch not responding => fall back to public]", async () => {
      const fakeGetLocalUrl = jest
        .spyOn(fetchHelper, "getLocalUrl")
        .mockReturnValue("http://localhost:3000/1.112.0/");
      const fakeTryFetch = jest
        .spyOn(fetchHelper, "tryFetch")
        .mockResolvedValue(undefined);
      const result = await getCDNBaseUrl(DEFAULT_UI5_FRAMEWORK, "1.112.0");
      expect(fakeGetLocalUrl).toHaveBeenCalled();
      expect(fakeTryFetch).toHaveBeenCalled();
      expect(result).toEqual("https://ui5.sap.com/1.112.0/");
    });
  });
  describe("getVersionJsonUrl", () => {
    it("get version uri for SAPUI5", () => {
      const result = getVersionJsonUrl("SAPUI5");
      expect(result).toStrictEqual("https://ui5.sap.com/version.json");
    });
    it("get version uri for OpenUI5", () => {
      const result = getVersionJsonUrl(OPEN_FRAMEWORK);
      expect(result).toStrictEqual("https://sdk.openui5.org/version.json");
    });
  });
});

describe("getVersionInfoUrl", () => {
  it("get version info uri for SAPUI5", async () => {
    const result = await getVersionInfoUrl(
      DEFAULT_UI5_FRAMEWORK,
      DEFAULT_UI5_VERSION
    );
    expect(result).toStrictEqual(
      "https://ui5.sap.com/1.71.72/resources/sap-ui-version.json"
    );
  });
  it("get version info uri for OpenUI5", async () => {
    const result = await getVersionInfoUrl(
      OPEN_FRAMEWORK,
      DEFAULT_OPEN_UI5_VERSION
    );
    expect(result).toStrictEqual(
      "https://sdk.openui5.org/1.71.68/resources/sap-ui-version.json"
    );
  });
});

it("getLibraryAPIJsonUrl", async () => {
  const result = await getLibraryAPIJsonUrl(
    DEFAULT_UI5_FRAMEWORK,
    DEFAULT_UI5_VERSION,
    "sap.m"
  );
  expect(result).toStrictEqual(
    "https://ui5.sap.com/1.71.72/test-resources/sap/m/designtime/api.json"
  );
});

describe("getVersionsMap", () => {
  it("get version map for SAPUI5 - http success", async () => {
    const data = {
      "1.71": {
        version: "1.71.70",
        support: "Maintenance",
        lts: true,
      },
    };
    const fetcherSpy = jest.fn().mockResolvedValue({
      ok: true,
      json: () => data,
    });
    const result = await getVersionsMap(DEFAULT_UI5_FRAMEWORK, fetcherSpy);
    expect(result).toEqual(data);
  });

  it("get version map for OpenUI5 - fallback default", async () => {
    const data = {
      latest: {
        version: "1.71.68",
        support: "Maintenance",
        lts: true,
      },
    };
    const fetcherSpy = jest.fn().mockResolvedValue({
      ok: false,
    });
    const result = await getVersionsMap(OPEN_FRAMEWORK, fetcherSpy);
    expect(result).toEqual(data);
  });
});

jest.mock("node-fetch", () => {
  return jest.createMockFromModule("node-fetch");
});

jest.mock("proxy-from-env", () => {
  return {
    getProxyForUrl: jest
      .fn()
      .mockReturnValueOnce(undefined)
      .mockReturnValue("proxy-value"),
  };
});

jest.mock("https-proxy-agent", () => {
  return jest.fn().mockReturnValue({
    pathname: "proxy-value",
    path: "proxy-value",
    href: "proxy-value",
  });
});

import * as node_fetch from "node-fetch";
import * as proxy from "proxy-from-env";
import { fetch } from "../../src/api";

describe("fetch", () => {
  it("fetch without getProxyForUrl", async () => {
    const fetchSpy = jest
      .spyOn(node_fetch, "default")
      .mockResolvedValue("ok" as unknown as node_fetch.Response);
    const proxySpy = jest.spyOn(proxy, "getProxyForUrl");
    const result = await fetch("test/url");
    expect(fetchSpy).toHaveBeenCalledWith("test/url", undefined);
    expect(proxySpy).toHaveBeenCalled();
    expect(result).toEqual("ok");
  });

  it("fetch without getProxyForUrl", async () => {
    const fetchSpy = jest
      .spyOn(node_fetch, "default")
      .mockResolvedValue("ok" as unknown as node_fetch.Response);
    const proxySpy = jest.spyOn(proxy, "getProxyForUrl");
    const result = await fetch("test/url");
    expect(fetchSpy).toHaveBeenCalledWith("test/url", {
      agent: {
        href: "proxy-value",
        path: "proxy-value",
        pathname: "proxy-value",
      },
    });
    expect(proxySpy).toHaveBeenCalled();
    expect(result).toEqual("ok");
  });
});

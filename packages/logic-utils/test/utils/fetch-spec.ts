import proxyquire from "proxyquire";
import { join } from "path";
import { expect } from "chai";
import { fake } from "sinon";
describe("fetch", () => {
  it("fetch without getProxyForUrl", async () => {
    const filePath = join(__dirname, "..", "..", "src", "utils", "fetch");
    const fakeGetProxyForUrl = fake.returns(undefined);
    const fakeFetch = fake.resolves("ok");
    const fetchModule = proxyquire
      .noPreserveCache()
      .noCallThru()
      .load(filePath, {
        "proxy-from-env": {
          getProxyForUrl: fakeGetProxyForUrl,
        },
        "node-fetch": fakeFetch,
      });
    const result = await fetchModule.fetch("test/url");
    expect(fakeGetProxyForUrl).to.have.been.called;
    expect(fakeFetch).to.have.been.called;
    expect(fakeFetch).to.have.been.calledWith("test/url", undefined);
    expect(result).to.be.equal("ok");
  });
  it("fetch with getProxyForUrl", async () => {
    const filePath = join(__dirname, "..", "..", "src", "utils", "fetch");
    const fakeGetProxyForUrl = fake.returns("proxy-value");
    const fakeFetch = fake.resolves("ok");
    const fakeHttpsProxyAgent = fake.returns({
      pathname: "proxy-value",
      path: "proxy-value",
      href: "proxy-value",
    });
    const fetchModule = proxyquire
      .noPreserveCache()
      .noCallThru()
      .load(filePath, {
        "proxy-from-env": {
          getProxyForUrl: fakeGetProxyForUrl,
        },
        "node-fetch": fakeFetch,
        "https-proxy-agent": fakeHttpsProxyAgent,
      });
    const result = await fetchModule.fetch("test/url");
    expect(fakeGetProxyForUrl).to.have.been.called;
    expect(fakeFetch).to.have.been.called;
    expect(fakeFetch).to.have.been.calledWith("test/url", {
      agent: {
        pathname: "proxy-value",
        path: "proxy-value",
        href: "proxy-value",
      },
    });
    expect(result).to.be.equal("ok");
  });
});

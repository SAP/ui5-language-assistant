import { restore, fake } from "sinon";
import { join } from "path";
import proxyquire from "proxyquire";
import { expect } from "chai";
import { getCDNBaseUrl } from "../../src/utils/ui5";

describe("ui5", () => {
  afterEach(() => {
    restore();
  });
  context("getCDNBaseUrl", () => {
    it("get CDN without local url [with version]", async () => {
      const result = await getCDNBaseUrl("SAPUI5", "1.111.0");
      expect(result).to.be.equal("https://ui5.sap.com/1.111.0/");
    });
    it("get CDN without local url [without version]", async () => {
      const result = await getCDNBaseUrl("SAPUI5", undefined);
      expect(result).to.be.equal("https://ui5.sap.com/");
    });
    it("get CDN with local url", async () => {
      const filePath = join(__dirname, "..", "..", "src", "utils", "ui5");
      const fakeGetLocalUrl = fake.returns("http://localhost:3000/1.111.0/");
      const fakeTryFetch = fake.resolves({ ok: true });
      const ui5Module = proxyquire
        .noPreserveCache()
        .noCallThru()
        .load(filePath, {
          "@ui5-language-assistant/logic-utils": {
            getLocalUrl: fakeGetLocalUrl,
            tryFetch: fakeTryFetch,
          },
        });
      const result = await ui5Module.getCDNBaseUrl("SAPUI5", "1.111.0");
      expect(fakeGetLocalUrl).to.have.been.called;
      expect(fakeTryFetch).to.have.been.called;
      expect(result).to.be.equal("http://localhost:3000/1.111.0/");
    });
    it("get CDN with local url [fetch not responding => fall back to public]", async () => {
      const filePath = join(__dirname, "..", "..", "src", "utils", "ui5");
      const fakeGetLocalUrl = fake.returns("http://localhost:3000/1.111.0/");
      const fakeTryFetch = fake.resolves(undefined);
      const ui5Module = proxyquire
        .noPreserveCache()
        .noCallThru()
        .load(filePath, {
          "@ui5-language-assistant/logic-utils": {
            getLocalUrl: fakeGetLocalUrl,
            tryFetch: fakeTryFetch,
          },
        });
      const result = await ui5Module.getCDNBaseUrl("SAPUI5", "1.111.0");
      expect(fakeGetLocalUrl).to.have.been.called;
      expect(fakeTryFetch).to.have.been.called;
      expect(result).to.be.equal("https://ui5.sap.com/1.111.0/");
    });
  });
});

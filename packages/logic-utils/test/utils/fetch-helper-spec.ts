import { Settings } from "@ui5-language-assistant/settings";
import { expect } from "chai";
import { restore, stub } from "sinon";
import * as fetchUtils from "../../src/utils/fetch";
import { tryFetch, getLocalUrl } from "../../src/utils/fetch-helper";

describe("fetch-helper", () => {
  afterEach(() => {
    restore();
  });
  context("localUrl", () => {
    it("check undefined", () => {
      const result = getLocalUrl();
      expect(result).to.be.undefined;
    });
    it("get local url without version [it adds forward slash]", () => {
      const result = getLocalUrl(undefined, {
        SAPUI5WebServer: "my.test.web.server",
      } as Settings);
      expect(result).to.be.equal("my.test.web.server/");
    });
    it("get local url without version", () => {
      const result = getLocalUrl(undefined, {
        SAPUI5WebServer: "my.test.web.server/",
      } as Settings);
      expect(result).to.be.equal("my.test.web.server/");
    });
    it("get local url with version", () => {
      const result = getLocalUrl("1.110.1", {
        SAPUI5WebServer: "my.test.web.server/",
      } as Settings);
      expect(result).to.be.equal("my.test.web.server/1.110.1/");
    });
  });
  context("tryFetch", () => {
    it("check respond", async () => {
      const fetchStub = stub(fetchUtils, "fetch").resolves({ ok: true } as any);
      const result = await tryFetch("/abc");
      expect(fetchStub).to.be.called;
      expect(result).to.be.deep.equal({ ok: true });
    });
    it("check undefined [respond ok = false]", async () => {
      const fetchStub = stub(fetchUtils, "fetch").resolves({
        ok: false,
      } as any);
      const result = await tryFetch("/abc");
      expect(fetchStub).to.be.called;
      expect(result).to.be.undefined;
    });
    it("check undefined [throw exception]", async () => {
      const result = await tryFetch("/dummy/uri");
      expect(result).to.be.undefined;
    });
  });
});

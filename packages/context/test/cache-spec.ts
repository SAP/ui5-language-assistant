import { expect } from "chai";
import { App } from "../src/types";
import { cache } from "../src/cache";

describe("cache", () => {
  it("show singleton instance", async () => {
    cache.setApp("key01", {} as unknown as App);
    // importing again - no new instance is generated
    const cacheModule = await import("../src/cache");
    expect(cache.getAppEntries()).to.deep.equal(
      cacheModule.cache.getAppEntries()
    );
  });
});

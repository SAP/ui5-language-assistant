import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { expect } from "chai";
import { cache } from "../src/cache";

describe("cache", () => {
  it("show singleton instance", async () => {
    cache.setUI5Model("key01", ({} as unknown) as UI5SemanticModel);
    // importing again - no new instance is generated
    const cacheModule = await import("../src/cache");
    expect(cache.getUI5ModelEntries()).to.deep.equal(
      cacheModule.cache.getUI5ModelEntries()
    );
  });
});

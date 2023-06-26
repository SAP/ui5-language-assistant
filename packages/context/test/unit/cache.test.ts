import { App, Project } from "../../src/types";
import { cache } from "../../src/cache";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";

describe("cache", () => {
  it("show singleton instance", async () => {
    cache.setApp("key01", {} as unknown as App);
    // importing again - no new instance is generated
    const cacheModule = await import("../../src/cache");
    expect(cache.getAppEntries()).toStrictEqual(
      cacheModule.cache.getAppEntries()
    );
  });

  describe("reading keys", () => {
    it("project", () => {
      cache.setProject("dummyRoot1", {} as unknown as Project);
      expect(cache.getProjectEntries()).toContainEqual("dummyRoot1");
    });

    it("services", () => {
      cache.setCAPServices("dummyRoot2", new Map());
      expect(cache.getCAPServiceEntries()).toContainEqual("dummyRoot2");
    });

    it("model", () => {
      cache.setUI5Model("dummyRoot3", {} as unknown as UI5SemanticModel);
      expect(cache.getUI5ModelEntries()).toContainEqual("dummyRoot3");
      const result = cache.deleteUI5Model("dummyRoot3");
      expect(result).toBeTrue();
      expect(cache.getUI5ModelEntries()).toBeEmpty();
    });
  });
});

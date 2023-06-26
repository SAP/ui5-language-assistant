import { clearKey } from "../../../src/utils/create";

describe("create", () => {
  describe("clearKey", () => {
    it("key = undefined", () => {
      const result = clearKey();
      expect(result).toStrictEqual("");
    });
    it("key without quotes", () => {
      const result = clearKey("testKey");
      expect(result).toStrictEqual("testKey");
    });
    it("key with single quote", () => {
      const result = clearKey(`'testKey'`);
      expect(result).toStrictEqual("testKey");
    });
    it("key with double quotes", () => {
      const result = clearKey(`"testKey"`);
      expect(result).toStrictEqual("testKey");
    });
    it("key with singe quote HTML equivalent", () => {
      const result = clearKey("&apos;testKey&apos;");
      expect(result).toStrictEqual("testKey");
    });
    it("key with double quotes HTML equivalent", () => {
      const result = clearKey("&quot;testKey&quot;");
      expect(result).toStrictEqual("testKey");
    });
  });
});

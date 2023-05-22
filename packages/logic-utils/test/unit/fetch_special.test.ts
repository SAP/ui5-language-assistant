jest.mock("node-fetch", () => {
  throw "Import fake error";
});

import { fetch } from "../../src/api";

// To reach out some exception handlers in the fetch module, import('node-fetch') failure is simulated
describe("fetch", () => {
  it("fetch without getProxyForUrl", async () => {
    try {
      await fetch("test/url");
    } catch (e) {
      expect(e).toMatchInlineSnapshot(
        `[TypeError: module.default is not a function]`
      );
    }
  });
});

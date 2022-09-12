import { resolve } from "path";
import { expect } from "chai";

import { SERVER_PATH } from "../src/api";

describe("the Language Server api", () => {
  beforeEach(() => {
    vi.mock("fs", async () => {
      return {
        ...(await vi.importActual<typeof import("fs")>("fs")),
        readFileSync: vi
          .fn()
          .mockReturnValue(
            JSON.stringify({ name: "@ui5-language-assistant/language-server" })
          ),
      };
    });
  });
  it("will get the correct path to server module", async () => {
    const serverPath = resolve(__dirname, "../", "src", "server.ts");
    expect(SERVER_PATH).to.deep.equal(serverPath);
  });
});

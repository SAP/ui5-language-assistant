import { resolve } from "path";
import { SERVER_PATH } from "../../src/api";

describe("the Language Server api", () => {
  it("will get the correct path to server module", async () => {
    const serverPath = resolve(__dirname, "..", "..", "src", "server.js");
    expect(SERVER_PATH).toEqual(serverPath);
  });
});

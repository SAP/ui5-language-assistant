import { expect } from "chai";
import { buildMessage } from "../src/api";

describe("buildMessage", () => {
  it("will build a message from given multiple arguments", () => {
    const result = buildMessage("{0} wonderful {1}", "Hello", "world");
    expect(result).to.equal("Hello wonderful world");
  });
});

import { expect } from "chai";
import { buildMessage } from "../src/api";

describe("buildMessage", () => {
  it("will build an error message for the validation", () => {
    const expectedErrorMessage = "Hello wonderful world";
    const result = buildMessage("{0} wonderful {1}", "Hello", "world");
    expect(expectedErrorMessage).to.be.equal(result);
  });
});

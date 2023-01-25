import { expect } from "chai";
import { getAffectedRange } from "../../../src/services/completion/utils";

describe("completion utils", () => {
  it("getAffectedRange edge use case", () => {
    const result = getAffectedRange();
    expect(result).to.be.undefined;
  });
});

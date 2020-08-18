import { expect } from "chai";
import { buildMessage, validations } from "../src/api";

describe("buildMessage", () => {
  it("will build an error message for the validation", () => {
    const expectedErrorMessage = validations.INVALID_AGGREGATION_CARDINALITY.msg.replace(
      "{0}",
      "Button"
    );

    const result = buildMessage(
      validations.INVALID_AGGREGATION_CARDINALITY.msg,
      "Button"
    );

    expect(expectedErrorMessage).to.be.equal(result);
  });
});

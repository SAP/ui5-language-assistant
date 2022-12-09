import { UI5Prop } from "@ui5-language-assistant/semantic-model-types";
import { expect } from "chai";
import {
  getPathConstraintsForControl,
  isPropertyPathAllowed,
} from "../../src/utils";

describe("misc utils", () => {
  describe("getPathConstraintsForControl", () => {
    it("missing specification", () => {
      const result = getPathConstraintsForControl("unknown", {} as UI5Prop);
      expect(result.expectedAnnotations).to.be.empty;
      expect(result.expectedTypes).to.be.empty;
    });

    it("control not defined", () => {
      const result = getPathConstraintsForControl(null, {} as UI5Prop);
      expect(result.expectedAnnotations).to.be.empty;
      expect(result.expectedTypes).to.be.empty;
    });

    it("property name is wrong", () => {
      const result = getPathConstraintsForControl("Chart", {
        name: "id",
      } as UI5Prop);
      expect(result.expectedAnnotations).to.be.empty;
      expect(result.expectedTypes).to.be.empty;
    });
  });

  it("isPropertyPathAllowed, control not defined", () => {
    const result = isPropertyPathAllowed(null);
    expect(result).to.be.false;
  });
});

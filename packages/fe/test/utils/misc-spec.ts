import { Context, ManifestDetails } from "@ui5-language-assistant/context";
import { UI5Prop } from "@ui5-language-assistant/semantic-model-types";
import { expect } from "chai";
import {
  getContextPath,
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

    it("no specification provided for a property", () => {
      const result = getPathConstraintsForControl("FilterBar", {
        name: "contextPath",
      } as UI5Prop);
      expect(result.expectedAnnotations).to.be.empty;
      expect(result.expectedTypes).to.be.empty;
    });
  });

  it("isPropertyPathAllowed, control not defined", () => {
    const result = isPropertyPathAllowed(null);
    expect(result).to.be.false;
  });

  describe("getContextPath", () => {
    const context = ({
      customViewId: "Main.view",
      manifestDetails: {
        customViews: {
          ["Main.view"]: {
            contextPath: "/Booking",
          },
        },
      },
    } as unknown) as Context;

    it("provided via attribute", () => {
      const result = getContextPath("/Travel", context);
      expect(result).to.equal("/Travel");
    });
    it("empty attribute", () => {
      const result = getContextPath("", context);
      expect(result).to.equal("");
    });
    it("attribute without value", () => {
      const result = getContextPath(null, context);
      expect(result).to.equal(null);
    });
    it("provided via manifest", () => {
      const result = getContextPath(undefined, context);
      expect(result).to.equal("/Booking");
    });
    it("empty in manifest", () => {
      const result = getContextPath(undefined, {
        ...context,
        manifestDetails: ({
          customViews: {
            ["Main.view"]: {
              contextPath: "",
            },
          },
        } as unknown) as ManifestDetails,
      });
      expect(result).to.undefined;
    });
    it("not existing in manifest", () => {
      const result = getContextPath(undefined, {
        ...context,
        manifestDetails: ({
          customViews: {
            ["Main.view"]: {},
          },
        } as unknown) as ManifestDetails,
      });
      expect(result).to.undefined;
    });
  });
});

import { Context, ManifestDetails } from "@ui5-language-assistant/context";
import { UI5Prop } from "@ui5-language-assistant/semantic-model-types";

import {
  getContextPath,
  getPathConstraintsForControl,
  isPropertyPathAllowed,
} from "../../../src/utils";

describe("misc utils", () => {
  describe("getPathConstraintsForControl", () => {
    it("missing specification", () => {
      const result = getPathConstraintsForControl("unknown", {} as UI5Prop);
      expect(result.expectedAnnotations).toBeEmpty();
      expect(result.expectedTypes).toBeEmpty();
    });

    it("control not defined", () => {
      const result = getPathConstraintsForControl(null, {} as UI5Prop);
      expect(result.expectedAnnotations).toBeEmpty();
      expect(result.expectedTypes).toBeEmpty();
    });

    it("property name is wrong", () => {
      const result = getPathConstraintsForControl("Chart", {
        name: "id",
      } as UI5Prop);
      expect(result.expectedAnnotations).toBeEmpty();
      expect(result.expectedTypes).toBeEmpty();
    });

    it("no specification provided for a property", () => {
      const result = getPathConstraintsForControl("FilterBar", {
        name: "contextPath",
      } as UI5Prop);
      expect(result.expectedAnnotations).toBeEmpty();
      expect(result.expectedTypes).toBeEmpty();
    });
  });

  it("isPropertyPathAllowed, control not defined", () => {
    const result = isPropertyPathAllowed(null);
    expect(result).toBeFalse();
  });

  describe("getContextPath", () => {
    const context = {
      customViewId: "Main.view",
      manifestDetails: {
        customViews: {
          ["Main.view"]: {
            contextPath: "/Booking",
          },
        },
      },
    } as unknown as Context;

    it("provided via attribute", () => {
      const result = getContextPath("/Travel", context);
      expect(result).toEqual("/Travel");
    });
    it("empty attribute", () => {
      const result = getContextPath("", context);
      expect(result).toEqual("");
    });
    it("attribute without value", () => {
      const result = getContextPath(null, context);
      expect(result).toEqual(null);
    });
    it("provided via manifest", () => {
      const result = getContextPath(undefined, context);
      expect(result).toEqual("/Booking");
    });
    it("empty in manifest", () => {
      const result = getContextPath(undefined, {
        ...context,
        manifestDetails: {
          customViews: {
            ["Main.view"]: {
              contextPath: "",
            },
          },
        } as unknown as ManifestDetails,
      });
      expect(result).toBeUndefined();
    });
    it("not existing in manifest", () => {
      const result = getContextPath(undefined, {
        ...context,
        manifestDetails: {
          customViews: {
            ["Main.view"]: {},
          },
        } as unknown as ManifestDetails,
      });
      expect(result).toBeUndefined();
    });
  });
});

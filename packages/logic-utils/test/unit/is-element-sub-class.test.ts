import {
  buildUI5Class,
  buildUI5Namespace,
} from "@ui5-language-assistant/test-utils";
import { isElementSubClass } from "../../src/api";

describe("The @ui5-language-assistant/logic-utils <isElementSubClass> function", () => {
  const sapNs = buildUI5Namespace({ name: "sap" });

  const uiNs = buildUI5Namespace({
    name: "ui",
    parent: sapNs,
  });

  const coreNs = buildUI5Namespace({
    name: "core",
    parent: uiNs,
  });

  const element = buildUI5Class({
    name: "Element",
    parent: coreNs,
    library: "sap.ui.core",
  });

  it("will identify UI5 Classes that are 'Elements'", () => {
    const page = buildUI5Class({
      name: "Page",
      extends: element,
      library: "sap.ui.core",
    });
    const actual = isElementSubClass(page);
    expect(actual).toBeTrue();
  });

  it("will **not** identify random classes as UI5 'Elements'", () => {
    const bamba = buildUI5Class({
      name: "Bamba",
      parent: coreNs,
      library: "sap.ui.core",
    });
    const actual = isElementSubClass(bamba);
    expect(actual).toBeFalse();
  });

  it("will **not** identify undefined as UI5 'Elements'", () => {
    const actual = isElementSubClass(undefined);
    expect(actual).toBeFalse();
  });
});

import { expect } from "chai";
import { buildUI5Class, buildUI5Namespace } from "@vscode-ui5/test-utils";
import { isControlSubClass } from "../../src/api";

describe("The @vscode-ui5/logic-utils <isControlSubClass> function", () => {
  const sapNs = buildUI5Namespace({ name: "sap" });

  const uiNs = buildUI5Namespace({
    name: "ui",
    parent: sapNs
  });

  const coreNs = buildUI5Namespace({
    name: "core",
    parent: uiNs
  });

  const control = buildUI5Class({
    name: "Control",
    parent: coreNs,
    library: "sap.ui.core"
  });

  it("will identify UI5 Classes that are Controls", () => {
    const page = buildUI5Class({
      name: "Page",
      extends: control,
      library: "sap.ui.core"
    });
    const actual = isControlSubClass(page);
    expect(actual).to.be.true;
  });

  it("will **not** identify random classes as UI5 Controls", () => {
    const bamba = buildUI5Class({
      name: "Bamba",
      parent: coreNs,
      library: "sap.ui.core"
    });
    const actual = isControlSubClass(bamba);
    expect(actual).to.be.false;
  });
});

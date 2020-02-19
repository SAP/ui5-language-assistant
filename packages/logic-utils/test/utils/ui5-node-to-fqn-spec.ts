import { expect } from "chai";

import { ui5NodeToFQN } from "../../src/api";
import { buildUI5Class, buildUI5Namespace } from "@vscode-ui5/test-utils";

describe("The @vscode-ui5/logic-utils <ui5NodeToFQN> function", () => {
  const sapNs = buildUI5Namespace({ name: "sap" });
  const uiNs = buildUI5Namespace({ name: "ui", parent: sapNs });
  const coreNs = buildUI5Namespace({ name: "core", parent: uiNs });
  const control = buildUI5Class({
    name: "Control",
    parent: coreNs,
    library: "sap.ui.core"
  });

  it("will return the fully qualified name of a UI5 Node", () => {
    const controlFqn = ui5NodeToFQN(control);
    expect(controlFqn).to.eql("sap.ui.core.Control");
  });
});

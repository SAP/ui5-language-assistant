import { expect } from "chai";

import { ui5NodeToFQN } from "../../src/api";
import { UI5Class, UI5Namespace } from "@vscode-ui5/semantic-model";

describe("The @vscode-ui5/logic-utils <ui5NodeToFQN> function", () => {
  const commonProps = {
    parent: undefined as any,
    description: undefined,
    since: undefined,
    deprecatedInfo: undefined
  };

  const sapNs: UI5Namespace = {
    name: "sap",
    parent: undefined,
    classes: [],
    deprecatedInfo: undefined,
    description: "",
    fields: [],
    kind: "UI5Namespace",
    library: "",
    methods: [],
    namespaces: [],
    since: "",
    visibility: "public",
    ...commonProps
  };

  const uiNs: UI5Namespace = {
    ...commonProps,
    name: "ui",
    parent: sapNs,
    classes: [],
    deprecatedInfo: undefined,
    description: "",
    fields: [],
    kind: "UI5Namespace",
    library: "",
    methods: [],
    namespaces: [],
    since: "",
    visibility: "public"
  };

  const coreNs: UI5Namespace = {
    ...commonProps,
    name: "core",
    parent: uiNs,
    classes: [],
    deprecatedInfo: undefined,
    description: "",
    fields: [],
    kind: "UI5Namespace",
    library: "",
    methods: [],
    namespaces: [],
    since: "",
    visibility: "public"
  };

  const control: UI5Class = {
    ...commonProps,
    name: "Control",
    parent: coreNs,
    constructor: undefined as any,
    library: "sap.ui.core",
    kind: "UI5Class",
    extends: undefined,
    visibility: "public",
    implements: [],
    methods: [],
    properties: [],
    aggregations: [],
    associations: [],
    events: []
  };
  it("will return the fully qualified name of a UI5 Node", () => {
    const controlFqn = ui5NodeToFQN(control);
    expect(controlFqn).to.eql("sap.ui.core.Control");
  });
});

import { expect } from "chai";
import { UI5Class, UI5Namespace } from "@vscode-ui5/semantic-model";

import { isControlSubClass } from "../../src/api";

describe("The @vscode-ui5/logic-utils <isControlSubClass> function", () => {
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

  it("will identify UI5 Classes that are Controls", () => {
    const page: UI5Class = {
      ...commonProps,
      constructor: undefined as any,
      library: "sap.ui.core",
      name: "Page",
      kind: "UI5Class",
      extends: control,
      visibility: "public",
      implements: [],
      methods: [],
      properties: [],
      aggregations: [],
      associations: [],
      events: []
    };

    const actual = isControlSubClass(page);
    expect(actual).to.be.true;
  });

  it("will **not** identify random classes as UI5 Controls", () => {
    const bamba: UI5Class = {
      ...commonProps,
      parent: coreNs,
      constructor: undefined as any,
      library: "sap.ui.core",
      name: "Bamba",
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

    const actual = isControlSubClass(bamba);
    expect(actual).to.be.false;
  });
});

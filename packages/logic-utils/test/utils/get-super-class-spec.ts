import { expect } from "chai";
import { UI5Class } from "@vscode-ui5/semantic-model";

import { getSuperClasses } from "../../src/api";

describe("The @vscode-ui5/logic-utils <getSuperClasses> function", () => {
  const commonProps = {
    parent: undefined as any,
    description: undefined,
    since: undefined,
    deprecatedInfo: undefined
  };

  const clazzA: UI5Class = {
    ...commonProps,
    constructor: undefined as any,
    library: "sap.ui.core",
    name: "A",
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

  const clazzB: UI5Class = {
    ...commonProps,
    constructor: undefined as any,
    library: "sap.ui.core",
    name: "B",
    kind: "UI5Class",
    extends: clazzA,
    visibility: "public",
    implements: [],
    methods: [],
    properties: [],
    aggregations: [],
    associations: [],
    events: []
  };

  const clazzC: UI5Class = {
    ...commonProps,
    constructor: undefined as any,
    library: "sap.ui.core",
    name: "C",
    kind: "UI5Class",
    extends: clazzB,
    visibility: "public",
    implements: [],
    methods: [],
    properties: [],
    aggregations: [],
    associations: [],
    events: []
  };

  it("will return direct parent superClass", () => {
    const superClasses = getSuperClasses(clazzB);
    expect(superClasses).to.have.lengthOf(1);
    expect(superClasses).to.include.members([clazzA]);
  });

  it("will return transitive parents superClasses", () => {
    const superClasses = getSuperClasses(clazzC);
    expect(superClasses).to.have.lengthOf(2);
    expect(superClasses).to.include.members([clazzA, clazzB]);
  });
});

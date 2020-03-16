import { expect } from "chai";
import { buildUI5Class } from "@ui5-editor-tools/test-utils";

import { getSuperClasses } from "../../src/api";

describe("The @ui5-editor-tools/logic-utils <getSuperClasses> function", () => {
  const clazzA = buildUI5Class({ name: "A", library: "sap.ui.core" });
  const clazzB = buildUI5Class({
    name: "B",
    extends: clazzA,
    library: "sap.ui.core"
  });
  const clazzC = buildUI5Class({
    name: "C",
    extends: clazzB,
    library: "sap.ui.core"
  });

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

import { expect } from "chai";
import { cloneDeep } from "lodash";
import { buildUI5Class, generateModel } from "@ui5-editor-tools/test-utils";

import { getSuperClasses } from "../../src/api";
import { UI5Class } from "@ui5-editor-tools/semantic-model-types";

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

  it("will avoid infinite loops in case of cyclic extends clauses", () => {
    const ui5Model = cloneDeep(generateModel("1.74.0"));
    const fAvatar = ui5Model.classes["sap.f.Avatar"];
    const mAvatar = fAvatar.extends as UI5Class;
    // create cyclic extends refs
    mAvatar.extends = fAvatar;
    const superClasses = getSuperClasses(fAvatar);
    // Normally there would also additional superClasses, but we broke the graph...
    expect(superClasses).to.have.lengthOf(2);
    expect(superClasses).to.include.members([fAvatar, mAvatar]);
  });
});

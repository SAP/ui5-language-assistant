import { map } from "lodash";
import { expect } from "chai";
import { UI5SemanticModel } from "@ui5-editor-tools/semantic-model-types";
import { generateModel } from "@ui5-editor-tools/test-utils";
import { findClassesMatchingType, ui5NodeToFQN } from "../../src/api";

const ui5Model: UI5SemanticModel = generateModel("1.74.0");

describe("The @ui5-editor-tools/logic-utils <findClassesMatchingType> function", () => {
  it("can locate classes matching an interface", () => {
    const targetInterface = ui5Model.interfaces["sap.m.IconTab"];
    const matchingClasses = findClassesMatchingType({
      type: targetInterface,
      model: ui5Model
    });
    const matchingClassesNames = map(matchingClasses, ui5NodeToFQN);
    // TODO: waiting for reply from Frank if "implements" relationship is transitive in UI5 (UI5 is strange in may ways...)
    expect(matchingClassesNames).to.deep.equalInAnyOrder([
      "sap.m.IconTabFilter",
      "sap.m.IconTabSeparator"
    ]);
  });

  it("can locate classes matching another Class", () => {
    const targetClassType = ui5Model.classes["sap.m.ListBase"];
    const matchingClasses = findClassesMatchingType({
      type: targetClassType,
      model: ui5Model
    });
    const matchingClassesNames = map(matchingClasses, ui5NodeToFQN);
    expect(matchingClassesNames).to.deep.equalInAnyOrder([
      "sap.f.GridList",
      "sap.m.FacetFilterList",
      "sap.m.GrowingList",
      "sap.m.List",
      "sap.m.ListBase",
      "sap.m.Table",
      "sap.m.Tree"
    ]);
  });
});

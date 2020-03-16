import { map } from "lodash";
import { expect } from "chai";
import { UI5SemanticModel } from "@vscode-ui5/semantic-model-types";
import { generateModel } from "@vscode-ui5/test-utils";
import { findClassesMatchingType, ui5NodeToFQN } from "../../src/api";

const ui5Model: UI5SemanticModel = generateModel("1.74.0");

describe("The @vscode-ui5/logic-utils <findClassesMatchingType> function", () => {
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

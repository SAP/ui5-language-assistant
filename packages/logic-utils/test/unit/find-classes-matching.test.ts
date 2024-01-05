import { map, forEach, cloneDeep } from "lodash";

import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { generateModel } from "@ui5-language-assistant/test-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import {
  findClassesMatchingType,
  ui5NodeToFQN,
  classIsOfType,
} from "../../src/api";

describe("The @ui5-language-assistant/logic-utils <findClassesMatchingType> function", () => {
  let ui5Model: UI5SemanticModel;
  beforeAll(async () => {
    ui5Model = await generateModel({
      framework: "SAPUI5",
      version: "1.71.61",
      modelGenerator: generate,
    });
  });

  it("can locate classes matching an interface directly", () => {
    const targetInterface = ui5Model.interfaces["sap.m.IconTab"];
    const matchingClasses = findClassesMatchingType({
      type: targetInterface,
      model: ui5Model,
    });
    const matchingClassesNames = map(matchingClasses, ui5NodeToFQN);
    expect(matchingClassesNames).toIncludeSameMembers([
      "sap.m.IconTabFilter",
      "sap.m.IconTabSeparator",
    ]);
  });

  it("can locate classes matching an interface transitively", () => {
    const expectedTransitiveMatches = [
      ui5Model.classes["sap.tnt.ToolHeader"],
      ui5Model.classes["sap.uxap.AnchorBar"],
    ];
    const targetInterface = ui5Model.interfaces["sap.m.IBar"];
    forEach(expectedTransitiveMatches, (_) => {
      expect(_.implements).not.toIncludeAnyMembers([targetInterface]);
    });

    const matchingClasses = findClassesMatchingType({
      type: targetInterface,
      model: ui5Model,
    });
    expect(matchingClasses).toIncludeAllMembers(expectedTransitiveMatches);
  });

  it("can locate classes matching another Class", () => {
    const targetClassType = ui5Model.classes["sap.m.ListBase"];
    const matchingClasses = findClassesMatchingType({
      type: targetClassType,
      model: ui5Model,
    });
    const matchingClassesNames = map(matchingClasses, ui5NodeToFQN);
    expect(matchingClassesNames).toIncludeSameMembers([
      "sap.f.GridList",
      "sap.m.FacetFilterList",
      "sap.m.GrowingList",
      "sap.m.List",
      "sap.m.ListBase",
      "sap.m.Table",
      "sap.m.Tree",
      "sap.ca.ui.Notes",
    ]);
  });
});

describe("The @ui5-language-assistant/logic-utils <classIsOfType> function", () => {
  let ui5Model: UI5SemanticModel;
  const beforeAllPromise = generateModel({
    framework: "SAPUI5",
    version: "1.71.61",
    modelGenerator: generate,
  });

  beforeAll(async () => {
    ui5Model = await beforeAllPromise;
  });

  it("can tell if the class matching a UI5Interface type", () => {
    const targetInterface = ui5Model.interfaces["sap.m.IconTab"];
    const ui5Class = ui5Model.classes["sap.m.IconTabFilter"];
    expect(classIsOfType(ui5Class, targetInterface)).toBeTrue();
  });

  it("can tell if the class matching a UI5Class type", () => {
    const targetClassType = ui5Model.classes["sap.m.ListBase"];
    const ui5Class = ui5Model.classes["sap.m.Table"];
    expect(classIsOfType(ui5Class, targetClassType)).toBeTrue();
  });

  it("negative case - can tell if the class matching a UI5Interface type", () => {
    const targetInterface = ui5Model.interfaces["sap.m.IBar"];
    const ui5Class = ui5Model.classes["sap.m.IconTabFilter"];
    expect(classIsOfType(ui5Class, targetInterface)).toBeFalse();
  });

  describe("classes with returnTypes specified in metadata", () => {
    let adaptedUI5Model: UI5SemanticModel;
    beforeAll(async () => {
      adaptedUI5Model = cloneDeep(await beforeAllPromise);
      adaptedUI5Model.classes["sap.ui.layout.BlockLayout"].returnTypes = [
        adaptedUI5Model.classes["sap.ui.layout.form.FormElement"],
      ];
    });

    it("can tell if the class matching a UI5Class type", () => {
      const targetClassType =
        adaptedUI5Model.classes["sap.ui.layout.form.FormElement"];
      const ui5Class = adaptedUI5Model.classes["sap.ui.layout.BlockLayout"];
      expect(classIsOfType(ui5Class, targetClassType)).toBeTrue();
    });
  });
});

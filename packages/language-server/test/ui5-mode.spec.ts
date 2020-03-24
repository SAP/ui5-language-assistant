import { expect } from "chai";
import { UI5SemanticModel } from "@ui5-editor-tools/semantic-model-types";
import { generateModel } from "@ui5-editor-tools/test-utils";

import { getSemanticModel, UI5_VERSION } from "../src/ui5-model";

const expectedUI5SemanticModel: UI5SemanticModel = generateModel(UI5_VERSION);

describe("the UI5 tools ui5 model", () => {
  it("will get UI5 semantic model", async () => {
    const ui5Model = await getSemanticModel();
    expect(ui5Model.version).to.deep.equal(expectedUI5SemanticModel.version);
    expect(Object.keys(ui5Model.classes).length).to.be.greaterThan(200);
    expect(Object.keys(ui5Model.namespaces).length).to.be.greaterThan(200);
    expect(Object.keys(ui5Model.interfaces).length).to.be.greaterThan(30);
    expect(Object.keys(ui5Model.functions).length).to.be.greaterThan(30);
    expect(Object.keys(ui5Model.enums).length).to.be.greaterThan(200);
    expect(Object.keys(ui5Model.typedefs).length).to.be.greaterThan(10);
  }).timeout(5000);
});

import { expect } from "chai";

import { getSemanticModel } from "../src/ui5-model";

describe("the UI5 language assistant ui5 model", () => {
  it("will get UI5 semantic model", async () => {
    const ui5Model = await getSemanticModel();
    expect(ui5Model.version).to.equal("1.71.14");

    expect(Object.keys(ui5Model.classes).length).to.be.greaterThan(200);
    expect(Object.keys(ui5Model.namespaces).length).to.be.greaterThan(200);
    expect(Object.keys(ui5Model.interfaces).length).to.be.greaterThan(30);
    expect(Object.keys(ui5Model.functions).length).to.be.greaterThan(30);
    expect(Object.keys(ui5Model.enums).length).to.be.greaterThan(200);
    expect(Object.keys(ui5Model.typedefs).length).to.be.greaterThan(10);

    expect(Object.keys(ui5Model.classes)).to.include("sap.m.List");
    expect(Object.keys(ui5Model.namespaces)).to.include("sap.m");
    expect(Object.keys(ui5Model.interfaces)).to.include("sap.f.ICard");
    expect(Object.keys(ui5Model.functions)).to.include(
      "module:sap/base/assert"
    );
    expect(Object.keys(ui5Model.enums)).to.include("sap.m.ButtonType");
    expect(Object.keys(ui5Model.typedefs)).to.include("sap.ui.fl.Selector");

    // Dist layer
    expect(Object.keys(ui5Model.classes)).to.include("sap.ui.vk.Camera");
    expect(Object.keys(ui5Model.namespaces)).to.include("sap.apf.base");
    expect(Object.keys(ui5Model.enums)).to.include(
      "sap.ca.ui.charts.ChartSelectionMode"
    );
  }).timeout(5000); // The default timeout is 2000ms and this test takes ~3000ms
});

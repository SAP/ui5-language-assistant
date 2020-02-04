const { expect } = require("chai");
const { add } = require("../");

describe("The ui5-vscode semantic model package", () => {
  it("Dummy Test", () => {
    expect(add(1, 1)).to.eql(2);
  });
});

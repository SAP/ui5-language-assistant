import { expect } from "chai";
import { add, subtract } from "../src/api";

describe("The ui5-vscode semantic model package", () => {
  it("Dummy Test Add", () => {
    expect(add(1, 1)).to.eql(2);
  });
});

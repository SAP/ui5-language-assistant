import { expect } from "chai";
import { splitQNameByNamespace } from "../../src/api";

describe("The @ui5-language-assistant/logic-utils <splitQNameByNamespace> function", () => {
  it("returns the name with undefined namespace if it's not qualified", () => {
    const { ns, name } = splitQNameByNamespace("some.name");
    expect(ns).to.be.undefined;
    expect(name).to.equal("some.name");
  });

  it("returns the namespace and name for qualified name", () => {
    const { ns, name } = splitQNameByNamespace("thenamespace:some.name");
    expect(ns).to.equal("thenamespace");
    expect(name).to.equal("some.name");
  });

  it("returns empty name if qname ends with :", () => {
    const { ns, name } = splitQNameByNamespace("thenamespace:");
    expect(ns).to.equal("thenamespace");
    expect(name).to.equal("");
  });

  it("returns empty namespace if qname starts with :", () => {
    const { ns, name } = splitQNameByNamespace(":some.name");
    expect(ns).to.equal("");
    expect(name).to.equal("some.name");
  });

  it("returns empty name and namespace if qname is :", () => {
    const { ns, name } = splitQNameByNamespace(":");
    expect(ns).to.equal("");
    expect(name).to.equal("");
  });

  it("returns empty name and undefined namespace if qname is empty string", () => {
    const { ns, name } = splitQNameByNamespace("");
    expect(ns).to.be.undefined;
    expect(name).to.equal("");
  });

  it("splits on the first :", () => {
    const { ns, name } = splitQNameByNamespace("thenamespace:some:name");
    expect(ns).to.equal("thenamespace");
    expect(name).to.equal("some:name");
  });
});

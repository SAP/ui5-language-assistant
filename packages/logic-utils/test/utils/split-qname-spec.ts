import { expect } from "chai";
import { splitQNameByNamespace } from "../../src/api";

describe("The @ui5-language-assistant/logic-utils <splitQNameByNamespace> function", () => {
  it("returns the local name with undefined prefix if it's not qualified", () => {
    const { prefix, localName } = splitQNameByNamespace("some.name");
    expect(prefix).to.be.undefined;
    expect(localName).to.equal("some.name");
  });

  it("returns the prefix and local name for qualified name", () => {
    const { prefix, localName } = splitQNameByNamespace(
      "thenamespace:some.name"
    );
    expect(prefix).to.equal("thenamespace");
    expect(localName).to.equal("some.name");
  });

  it("returns empty local name if qname ends with :", () => {
    const { prefix, localName } = splitQNameByNamespace("thenamespace:");
    expect(prefix).to.equal("thenamespace");
    expect(localName).to.equal("");
  });

  it("returns empty prefix if qname starts with :", () => {
    const { prefix, localName } = splitQNameByNamespace(":some.name");
    expect(prefix).to.equal("");
    expect(localName).to.equal("some.name");
  });

  it("returns empty local name and prefix if qname is :", () => {
    const { prefix, localName } = splitQNameByNamespace(":");
    expect(prefix).to.equal("");
    expect(localName).to.equal("");
  });

  it("returns empty local name and undefined prefix if qname is an empty string", () => {
    const { prefix, localName } = splitQNameByNamespace("");
    expect(prefix).to.be.undefined;
    expect(localName).to.equal("");
  });

  it("splits on the first :", () => {
    const { prefix, localName } = splitQNameByNamespace(
      "thenamespace:some:name"
    );
    expect(prefix).to.equal("thenamespace");
    expect(localName).to.equal("some:name");
  });
});

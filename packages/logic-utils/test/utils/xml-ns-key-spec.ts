import { expect } from "chai";
import { isXMLNamespaceKey, getXMLNamespaceKeyPrefix } from "../../src/api";

describe("The @ui5-language-assistant/logic-utils <isXMLNamespaceKey> function", () => {
  it("will return true for attribute name starting with xmlns:", () => {
    expect(isXMLNamespaceKey("xmlns:a")).to.be.true;
  });

  it("will return true for attribute name starting with xmlns: that contains dots", () => {
    expect(isXMLNamespaceKey("xmlns:a.b.c")).to.be.true;
  });

  it("will return true for the default namespace attribute", () => {
    expect(isXMLNamespaceKey("xmlns")).to.be.true;
  });

  it("will return true for xmlns attribute without a name", () => {
    // Note: this is supported for the case of code completion
    expect(isXMLNamespaceKey("xmlns:")).to.be.true;
  });

  it("will return false for the non-xmlns attribute", () => {
    expect(isXMLNamespaceKey("abc")).to.be.false;
  });

  it("will return false for the non-xmlns attribute that starts with xmlns", () => {
    expect(isXMLNamespaceKey("xmlnst")).to.be.false;
  });
});

describe("The @ui5-language-assistant/logic-utils <getNamespaceKeyPrefix> function", () => {
  it("will return the name without xmlns prefix for xmlns attribute with name", () => {
    expect(getXMLNamespaceKeyPrefix("xmlns:abc")).to.eql("abc");
  });

  it("will return the name without xmlns prefix for xmlns attribute with name that contains dots", () => {
    expect(getXMLNamespaceKeyPrefix("xmlns:abc.efg")).to.eql("abc.efg");
  });

  it("will return empty string when key does not start with xmlns", () => {
    expect(getXMLNamespaceKeyPrefix("abc")).to.be.empty;
  });

  it("will return empty string when symbol '*' goes after xmlns", () => {
    expect(getXMLNamespaceKeyPrefix("xmlns*")).to.be.empty;
  });

  it("will return empty string when prefix is undefined", () => {
    expect(getXMLNamespaceKeyPrefix("xmlns:")).to.be.empty;
  });
});

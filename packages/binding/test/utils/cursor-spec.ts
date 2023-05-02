import { parsePropertyBindingInfo } from "@ui5-language-assistant/binding-parser";
import { expect } from "chai";
import {
  ColonContext,
  KeyContext,
  KeyValueContext,
  ValueContext,
} from "../../src/types";
import { getCursorContext } from "../../src/utils";
const getData = (snippet: string) => {
  const param = {
    position: { line: 0, character: snippet.indexOf("<CURSOR>") },
    textDocument: { uri: "" },
  };
  snippet = snippet.replace("<CURSOR>", "");
  const { ast } = parsePropertyBindingInfo(snippet);
  return { param, ast, prefix: snippet };
};
const getCursorContextResult = (snippet: string) => {
  const { param, ast, prefix } = getData(snippet);
  return getCursorContext(param, ast, prefix);
};

describe("cursor", () => {
  it("get initial context", () => {
    const snippet = `<CURSOR>`;
    const result = getCursorContextResult(snippet);
    expect(result).to.deep.equal({
      type: "initial",
      kind: "expression-binding",
    });
  });
  it("get empty context", () => {
    const snippet = `{ <CURSOR> }`;
    const result = getCursorContextResult(snippet);
    expect(result).to.deep.equal({
      type: "empty",
      kind: "properties",
    });
  });
  context("get key context", () => {
    it("a. `<CURSOR>`keyProperty", () => {
      const snippet = `{ <CURSOR>keyProperty }`;
      const { type, kind, element } = getCursorContextResult(
        snippet
      ) as KeyContext;
      expect({ type, kind }).to.deep.equal({
        type: "key",
        kind: "properties-excluding-duplicate",
      });
      expect(element).not.to.be.undefined;
    });
    it("b. keyProperty`<CURSOR>`", () => {
      const snippet = `{ keyProperty<CURSOR> }`;
      const { type, kind, element } = getCursorContextResult(
        snippet
      ) as KeyContext;
      expect({ type, kind }).to.deep.equal({
        type: "key",
        kind: "properties-excluding-duplicate",
      });
      expect(element).not.to.be.undefined;
    });
    it("c. key`<CURSOR>`Property", () => {
      const snippet = `{ key<CURSOR>Property }`;
      const { type, kind, element } = getCursorContextResult(
        snippet
      ) as KeyContext;
      expect({ type, kind }).to.deep.equal({
        type: "key",
        kind: "properties-excluding-duplicate",
      });
      expect(element).not.to.be.undefined;
    });
  });
  context("get value context", () => {
    it("a. keyProperty: `<CURSOR>`", () => {
      const snippet = `{ keyProperty: <CURSOR> }`;
      const { kind, type, element } = getCursorContextResult(
        snippet
      ) as ValueContext;
      expect({ type, kind }).to.deep.equal({
        type: "value",
        kind: "value",
      });
      expect(element).not.to.be.undefined;
    });
    it("b. keyProperty: `<CURSOR>`'value-for-this-key'", () => {
      const snippet = `{ keyProperty: <CURSOR>'value-for-this-key'}`;
      const { kind, type, element } = getCursorContextResult(
        snippet
      ) as ValueContext;
      expect({ type, kind }).to.deep.equal({
        type: "value",
        kind: "value",
      });
      expect(element).not.to.be.undefined;
    });
    it("c. keyProperty: `<CURSOR>`  'value-for-this-key' [space]", () => {
      const snippet = `{ keyProperty: <CURSOR>  'value-for-this-key'}`;
      const { kind, type, element } = getCursorContextResult(
        snippet
      ) as ValueContext;
      expect({ type, kind }).to.deep.equal({
        type: "value",
        kind: "value",
      });
      expect(element).not.to.be.undefined;
    });
    it("d. keyProperty: 'value-for`<CURSOR>`-this-key'", () => {
      const snippet = `{ keyProperty: 'value-for<CURSOR>-this-key'}`;
      const { kind, type, element } = getCursorContextResult(
        snippet
      ) as ValueContext;
      expect({ type, kind }).to.deep.equal({
        type: "value",
        kind: "value",
      });
      expect(element).not.to.be.undefined;
    });
    it("e. keyProperty: 'value-for-this-key'`<CURSOR>`", () => {
      const snippet = `{ keyProperty: 'value-for-this-key'<CURSOR>}`;
      const { kind, type, element } = getCursorContextResult(
        snippet
      ) as ValueContext;
      expect({ type, kind }).to.deep.equal({
        type: "value",
        kind: "value",
      });
      expect(element).not.to.be.undefined;
    });
  });
  context("get key value context", () => {
    it("a. keyProperty: 'value-for-this-key'  `<CURSOR>` [spaces]", () => {
      const snippet = `{ keyProperty: 'value-for-this-key'  <CURSOR> }`;
      const { type, kind, element } = getCursorContextResult(
        snippet
      ) as KeyValueContext;
      expect({ type, kind }).to.deep.equal({
        type: "key-value",
        kind: "properties-with-value-excluding-duplicate",
      });
      expect(element).not.to.be.undefined;
    });
    it("b. keyProperty: 'value-for-this-key', `<CURSOR>` [comma]", () => {
      const snippet = `{ keyProperty: 'value-for-this-key',  <CURSOR> }`;
      const { type, kind, element } = getCursorContextResult(
        snippet
      ) as KeyValueContext;
      expect({ type, kind }).to.deep.equal({
        type: "key-value",
        kind: "properties-with-value-excluding-duplicate",
      });
      expect(element).not.to.be.undefined;
    });
    it("c. `<CURSOR>` keyProperty: 'value-for-this-key'", () => {
      const snippet = `{<CURSOR> keyProperty: 'value-for-this-key'}`;
      const { type, kind, element } = getCursorContextResult(
        snippet
      ) as KeyValueContext;
      expect({ type, kind }).to.deep.equal({
        type: "key-value",
        kind: "properties-with-value-excluding-duplicate",
      });
      expect(element).not.to.be.undefined;
    });
    it("d. `keyProperty: 'value-for-this-key',`<CURSOR>`, [between comma]", () => {
      const snippet = `{keyProperty: 'value-for-this-key',<CURSOR>, }`;
      const { type, kind, element } = getCursorContextResult(
        snippet
      ) as KeyValueContext;
      expect({ type, kind }).to.deep.equal({
        type: "key-value",
        kind: "properties-with-value-excluding-duplicate",
      });
      expect(element).not.to.be.undefined;
    });
  });
  context("get colon context", () => {
    it("a. keyProperty `<CURSOR>` 'value-for-this-key'", () => {
      const snippet = `{keyProperty <CURSOR> 'value-for-this-key'}`;
      const { kind, type, element } = getCursorContextResult(
        snippet
      ) as ColonContext;
      expect({ kind, type }).to.deep.equal({
        type: "colon",
        kind: "colon",
      });
      expect(element).not.to.be.undefined;
    });
    it("b. keyProperty `<CURSOR>` [space(s)]", () => {
      const snippet = `{keyProperty <CURSOR>}`;
      const { kind, type, element } = getCursorContextResult(
        snippet
      ) as ColonContext;
      expect({ kind, type }).to.deep.equal({
        type: "colon",
        kind: "colon",
      });
      expect(element).not.to.be.undefined;
    });
  });
});

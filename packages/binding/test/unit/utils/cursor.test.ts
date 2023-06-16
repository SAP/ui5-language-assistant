import { parseBinding } from "@ui5-language-assistant/binding-parser";
import { KeyContext, KeyValueContext, ValueContext } from "../../../src/types";
import { getCursorContext } from "../../../src/utils";
const getData = (snippet: string) => {
  const param = {
    position: { line: 0, character: snippet.indexOf("<CURSOR>") },
    textDocument: { uri: "" },
  };
  snippet = snippet.replace("<CURSOR>", "");
  const { ast } = parseBinding(snippet);
  return { param, ast, prefix: snippet };
};
const getCursorContextResult = (snippet: string) => {
  const { param, ast } = getData(snippet);
  return getCursorContext(param, ast.bindings[0], ast.spaces);
};

describe("cursor", () => {
  it("get empty context", () => {
    const snippet = `{ <CURSOR> }`;
    const result = getCursorContextResult(snippet);
    expect(result).toStrictEqual({
      type: "empty",
      kind: "properties",
    });
  });
  describe("get key context", () => {
    it("a. `<CURSOR>`keyProperty", () => {
      const snippet = `{ <CURSOR>keyProperty }`;
      const { type, kind, element } = getCursorContextResult(
        snippet
      ) as KeyContext;
      expect({ type, kind }).toStrictEqual({
        type: "key",
        kind: "properties-excluding-duplicate",
      });
      expect(element).toBeDefined();
    });
    it("b. keyProperty`<CURSOR>`", () => {
      const snippet = `{ keyProperty<CURSOR> }`;
      const { type, kind, element } = getCursorContextResult(
        snippet
      ) as KeyContext;
      expect({ type, kind }).toStrictEqual({
        type: "key",
        kind: "properties-excluding-duplicate",
      });
      expect(element).toBeDefined();
    });
    it("c. key`<CURSOR>`Property", () => {
      const snippet = `{ key<CURSOR>Property }`;
      const { type, kind, element } = getCursorContextResult(
        snippet
      ) as KeyContext;
      expect({ type, kind }).toStrictEqual({
        type: "key",
        kind: "properties-excluding-duplicate",
      });
      expect(element).toBeDefined();
    });
  });
  describe("get value context", () => {
    it("a. keyProperty: `<CURSOR>`", () => {
      const snippet = `{ keyProperty: <CURSOR> }`;
      const { kind, type, element } = getCursorContextResult(
        snippet
      ) as ValueContext;
      expect({ type, kind }).toStrictEqual({
        type: "value",
        kind: "value",
      });
      expect(element).toBeDefined();
    });
    it("b. keyProperty: `<CURSOR>`'value-for-this-key'", () => {
      const snippet = `{ keyProperty: <CURSOR>'value-for-this-key'}`;
      const { kind, type, element } = getCursorContextResult(
        snippet
      ) as ValueContext;
      expect({ type, kind }).toStrictEqual({
        type: "value",
        kind: "value",
      });
      expect(element).toBeDefined();
    });
    it("c. keyProperty: `<CURSOR>`  'value-for-this-key' [space]", () => {
      const snippet = `{ keyProperty: <CURSOR>  'value-for-this-key'}`;
      const { kind, type, element } = getCursorContextResult(
        snippet
      ) as ValueContext;
      expect({ type, kind }).toStrictEqual({
        type: "value",
        kind: "value",
      });
      expect(element).toBeDefined();
    });
    it("d. keyProperty: 'value-for`<CURSOR>`-this-key'", () => {
      const snippet = `{ keyProperty: 'value-for<CURSOR>-this-key'}`;
      const { kind, type, element } = getCursorContextResult(
        snippet
      ) as ValueContext;
      expect({ type, kind }).toStrictEqual({
        type: "value",
        kind: "value",
      });
      expect(element).toBeDefined();
    });
    it("e. keyProperty: 'value-for-this-key'`<CURSOR>`", () => {
      const snippet = `{ keyProperty: 'value-for-this-key'<CURSOR>}`;
      const { kind, type, element } = getCursorContextResult(
        snippet
      ) as ValueContext;
      expect({ type, kind }).toStrictEqual({
        type: "value",
        kind: "value",
      });
      expect(element).toBeDefined();
    });
    it("g. keyProperty `<CURSOR>` 'value-for-this-key' [missing colon]", () => {
      const snippet = `{keyProperty <CURSOR> 'value-for-this-key'}`;
      const { kind, type, element } = getCursorContextResult(
        snippet
      ) as ValueContext;
      expect({ kind, type }).toStrictEqual({
        type: "value",
        kind: "value",
      });
      expect(element).toBeDefined();
    });
    it("h. keyProperty `<CURSOR>` [space(s)] [missing colon]", () => {
      const snippet = `{keyProperty <CURSOR>}`;
      const { kind, type, element } = getCursorContextResult(
        snippet
      ) as ValueContext;
      expect({ kind, type }).toStrictEqual({
        type: "value",
        kind: "value",
      });
      expect(element).toBeDefined();
    });
  });
  describe("get key value context", () => {
    it("a. keyProperty: 'value-for-this-key'  `<CURSOR>` [spaces]", () => {
      const snippet = `{ keyProperty: 'value-for-this-key'  <CURSOR> }`;
      const { type, kind } = getCursorContextResult(snippet) as KeyValueContext;
      expect({ type, kind }).toStrictEqual({
        type: "key-value",
        kind: "properties-with-value-excluding-duplicate",
      });
    });
    it("b. keyProperty: 'value-for-this-key', `<CURSOR>` [comma]", () => {
      const snippet = `{ keyProperty: 'value-for-this-key',  <CURSOR> }`;
      const { type, kind } = getCursorContextResult(snippet) as KeyValueContext;
      expect({ type, kind }).toStrictEqual({
        type: "key-value",
        kind: "properties-with-value-excluding-duplicate",
      });
    });
    it("c. `<CURSOR>` keyProperty: 'value-for-this-key'", () => {
      const snippet = `{<CURSOR> keyProperty: 'value-for-this-key'}`;
      const { type, kind } = getCursorContextResult(snippet) as KeyValueContext;
      expect({ type, kind }).toStrictEqual({
        type: "key-value",
        kind: "properties-with-value-excluding-duplicate",
      });
    });
    it("d. `keyProperty: 'value-for-this-key',`<CURSOR>`, [between comma]", () => {
      const snippet = `{keyProperty: 'value-for-this-key',<CURSOR>, }`;
      const { type, kind } = getCursorContextResult(snippet) as KeyValueContext;
      expect({ type, kind }).toStrictEqual({
        type: "key-value",
        kind: "properties-with-value-excluding-duplicate",
      });
    });
    it("e. `keyProperty: 'value-for-this-key',`<CURSOR>`, [between comma - spaces]", () => {
      const snippet = `{keyProperty: 'value-for-this-key', <CURSOR>, }`;
      const { type, kind } = getCursorContextResult(snippet) as KeyValueContext;
      expect({ type, kind }).toStrictEqual({
        type: "key-value",
        kind: "properties-with-value-excluding-duplicate",
      });
    });
  });
  it("parts", () => {
    const snippet = `{ parts: [{<CURSOR>}] }`;
    const { kind, type, element } = getCursorContextResult(
      snippet
    ) as ValueContext;
    expect({ type, kind }).toStrictEqual({
      type: "value",
      kind: "value",
    });
    expect(element).toBeDefined();
  });
});

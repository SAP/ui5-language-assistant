import { typeToString } from "../../src/api";
import { UI5Type } from "@ui5-language-assistant/semantic-model-types";
import {
  buildUI5Namespace,
  buildUI5Class,
  buildUI5Interface,
  buildUI5Enum,
  buildUI5Typedef,
} from "@ui5-language-assistant/test-utils";

describe("The @ui5-language-assistant/logic-utils <typeToString> function", () => {
  const rootNS = buildUI5Namespace({ name: "rootNS" });

  it("returns the type name for unresolved type", () => {
    const type: UI5Type = {
      kind: "UnresolvedType",
      name: "mytypename",
    };
    expect(typeToString(type)).toEqual("mytypename");
  });

  it("returns the type name for primitive type", () => {
    const type: UI5Type = {
      kind: "PrimitiveType",
      name: "Float",
    };
    expect(typeToString(type)).toEqual("Float");
  });

  it("returns the name for root namespace", () => {
    expect(typeToString(rootNS)).toEqual("rootNS");
  });

  it("returns the fully qualified name for namespace", () => {
    const type: UI5Type = buildUI5Namespace({
      parent: rootNS,
      name: "myNS",
    });
    expect(typeToString(type)).toEqual("rootNS.myNS");
  });

  it("returns the fully qualified name for class", () => {
    const type: UI5Type = buildUI5Class({
      parent: rootNS,
      name: "myClass",
    });
    expect(typeToString(type)).toEqual("rootNS.myClass");
  });

  it("returns the fully qualified name for interface", () => {
    const innerNS = buildUI5Namespace({
      parent: rootNS,
      name: "inner",
    });
    const type: UI5Type = buildUI5Interface({
      parent: innerNS,
      name: "myInterface",
    });
    expect(typeToString(type)).toEqual("rootNS.inner.myInterface");
  });

  it("returns the fully qualified name for enum", () => {
    const type: UI5Type = buildUI5Enum({
      parent: rootNS,
      name: "myEnum",
    });
    expect(typeToString(type)).toEqual("rootNS.myEnum");
  });

  it("returns the fully qualified name for typedef", () => {
    const type: UI5Type = buildUI5Typedef({
      parent: rootNS,
      name: "myTypedef",
    });
    expect(typeToString(type)).toEqual("rootNS.myTypedef");
  });

  it("returns 'any' for undefined type", () => {
    expect(typeToString(undefined)).toEqual("any");
  });

  describe("array types", () => {
    it("adds [] after unresolved type name", () => {
      const type: UI5Type = {
        kind: "ArrayType",
        type: {
          kind: "UnresolvedType",
          name: "mytypename",
        },
      };
      expect(typeToString(type)).toEqual("mytypename[]");
    });

    it("adds [] after primitive type name", () => {
      const type: UI5Type = {
        kind: "ArrayType",
        type: {
          kind: "PrimitiveType",
          name: "Boolean",
        },
      };
      expect(typeToString(type)).toEqual("Boolean[]");
    });

    it("adds [] after undefined type name", () => {
      const type: UI5Type = {
        kind: "ArrayType",
        type: undefined,
      };
      expect(typeToString(type)).toEqual("any[]");
    });

    it("adds [] after array type name", () => {
      const type: UI5Type = {
        kind: "ArrayType",
        type: {
          kind: "ArrayType",
          type: {
            kind: "PrimitiveType",
            name: "Boolean",
          },
        },
      };
      expect(typeToString(type)).toEqual("Boolean[][]");
    });

    it("adds [] after class name", () => {
      // Other types with FQN follow the same logic
      const type: UI5Type = {
        kind: "ArrayType",
        type: buildUI5Class({
          parent: rootNS,
          name: "myClass",
        }),
      };
      expect(typeToString(type)).toEqual("rootNS.myClass[]");
    });
  });
});

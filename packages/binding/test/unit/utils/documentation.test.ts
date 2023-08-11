import { Context } from "@ui5-language-assistant/context";
import { getDocumentation } from "./../../../src/utils";
import { UI5TypedefProp } from "@ui5-language-assistant/semantic-model-types";
import {
  buildUI5Typedef,
  buildUI5Namespace,
} from "@ui5-language-assistant/test-utils";

const testNS = buildUI5Namespace({ name: "test" });

const testInnerNS = buildUI5Namespace({
  name: "inner",
  parent: testNS,
});

describe("documentation", () => {
  it("check PrimitiveType", () => {
    const prop = buildUI5Typedef({
      name: "TestTypedef",
      type: {
        kind: "PrimitiveType",
        name: "String",
      },
    }) as unknown as UI5TypedefProp;

    const result = getDocumentation(
      { ui5Model: {} } as unknown as Context,
      prop
    );
    expect(result).toMatchSnapshot();
  });
  it("check UI5Typedef, UI5Class or UI5Enum", () => {
    const prop = buildUI5Typedef({
      name: "TestTypedef",
      type: {
        kind: "UI5Typedef",
        name: "PropertyBindingInfo",
        parent: testInnerNS,
      },
    }) as unknown as UI5TypedefProp;
    const result = getDocumentation(
      { ui5Model: {} } as unknown as Context,
      prop
    );
    expect(result).toMatchSnapshot();
  });
  it("check UnionType", () => {
    const prop = buildUI5Typedef({
      name: "TestTypedef",
      type: {
        kind: "UnionType",
        types: [
          {
            kind: "UI5Typedef",
            name: "PropertyBindingInfo",
            parent: testInnerNS,
          },
        ],
      },
    }) as unknown as UI5TypedefProp;
    const result = getDocumentation(
      { ui5Model: {} } as unknown as Context,
      prop
    );
    expect(result).toMatchSnapshot();
  });
  it("check ArrayType", () => {
    const prop = buildUI5Typedef({
      name: "TestTypedef",
      type: {
        kind: "ArrayType",
        type: {
          kind: "UI5Typedef",
          name: "PropertyBindingInfo",
          parent: testInnerNS,
        },
      },
    }) as unknown as UI5TypedefProp;
    const result = getDocumentation(
      { ui5Model: {} } as unknown as Context,
      prop
    );
    expect(result).toMatchSnapshot();
  });
  it("check undefined type", () => {
    const prop = buildUI5Typedef({
      name: "TestTypedef",
    }) as unknown as UI5TypedefProp;

    const result = getDocumentation(
      { ui5Model: {} } as unknown as Context,
      prop
    );
    expect(result).toMatchSnapshot();
  });
});

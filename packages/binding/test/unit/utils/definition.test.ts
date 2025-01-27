import {
  UI5Class,
  UI5ConstructorParameters,
  UI5Type,
} from "@ui5-language-assistant/semantic-model-types";
import {
  getReference,
  getPossibleValuesForClass,
  buildType,
  getConstructorParameterProperties,
  getPossibleElement,
} from "../../../src/utils";
import { BindContext } from "../../../src/types";
import { OPEN_FRAMEWORK } from "@ui5-language-assistant/constant";

function createType<T>(param: unknown): T {
  return param as T;
}

describe("getReference", () => {
  it('should return "filters" for PrimitiveType with name Filter', () => {
    const type = { kind: "PrimitiveType", name: "Filter" };
    expect(getReference(createType<UI5Type>(type))).toBe("filters");
  });

  it('should return "filters" for UI5Enum with name Filter', () => {
    const type = { kind: "UI5Enum", name: "Filter" };
    expect(getReference(createType<UI5Type>(type))).toBe("filters");
  });

  it('should return "filters" for UI5Class with name Filter', () => {
    const type = { kind: "UI5Class", name: "Filter" };
    expect(getReference(createType<UI5Type>(type))).toBe("filters");
  });

  it('should return "filters" for UI5Typedef with name Filter', () => {
    const type = { kind: "UI5Typedef", name: "Filter" };
    expect(getReference(createType<UI5Type>(type))).toBe("filters");
  });

  it("should return undefined for PrimitiveType with different name", () => {
    const type = { kind: "PrimitiveType", name: "Other" };
    expect(getReference(createType<UI5Type>(type))).toBeUndefined();
  });

  it("should return reference for ArrayType", () => {
    const type = {
      kind: "ArrayType",
      type: { kind: "PrimitiveType", name: "Filter" },
    };
    expect(getReference(createType<UI5Type>(type))).toBe("filters");
  });

  it("should return reference for UnionType", () => {
    const type = {
      kind: "UnionType",
      types: [
        { kind: "PrimitiveType", name: "Other" },
        { kind: "PrimitiveType", name: "Filter" },
      ],
    };
    expect(getReference(createType<UI5Type>(type))).toBe("filters");
  });

  it("should return undefined for unknown type", () => {
    const type = { kind: "UnknownType", name: "Filter" };
    expect(getReference(createType<UI5Type>(type))).toBeUndefined();
  });
});

describe("getPossibleValuesForClass", () => {
  it("should return possible values for a given UI5 class", () => {
    const context = {
      ui5Model: {
        classes: {
          ClassA: { extends: { name: "BaseClass", kind: "class" } },
          ClassB: { extends: { name: "BaseClass", kind: "class" } },
          ClassC: { extends: { name: "OtherClass", kind: "class" } },
        },
      },
    };

    const type = { name: "BaseClass", kind: "class" };

    const result = getPossibleValuesForClass(
      createType<BindContext>(context),
      createType<UI5Class>(type)
    );

    expect(result).toEqual(["ClassA", "ClassB"]);
  });

  it("should return an empty array if no classes extend the given UI5 class", () => {
    const context = {
      ui5Model: {
        classes: {
          ClassA: { extends: { name: "OtherClass", kind: "class" } },
          ClassB: { extends: { name: "OtherClass", kind: "class" } },
        },
      },
    };

    const type = { name: "BaseClass", kind: "class" };

    const result = getPossibleValuesForClass(
      createType<BindContext>(context),
      createType<UI5Class>(type)
    );

    expect(result).toEqual([]);
  });

  it("should handle nested extensions correctly", () => {
    const context = {
      ui5Model: {
        classes: {
          ClassA: {
            extends: {
              name: "IntermediateClass",
              kind: "class",
              extends: { name: "BaseClass", kind: "class" },
            },
          },
          ClassB: { extends: { name: "BaseClass", kind: "class" } },
        },
      },
    };

    const type = { name: "BaseClass", kind: "class" };

    const result = getPossibleValuesForClass(
      createType<BindContext>(context),
      createType<UI5Class>(type)
    );

    expect(result).toEqual(["ClassA", "ClassB"]);
  });
});

describe("buildType", () => {
  it("should build PropertyType array for UI5Any type", () => {
    const param = {
      context: createType<BindContext>({}),
      type: createType<UI5Type>({ kind: "UI5Any", name: "any" }),
      name: "testName",
      collection: false,
    };
    const result = buildType(param);
    expect(result).toEqual([
      {
        kind: "any",
        dependents: expect.any(Array),
        notAllowedElements: expect.any(Array),
        collection: false,
        reference: undefined,
      },
    ]);
  });

  it("should build PropertyType array for PrimitiveType", () => {
    const param = {
      context: createType<BindContext>({}),
      type: createType<UI5Type>({ kind: "PrimitiveType", name: "Boolean" }),
      name: "testName",
      collection: false,
    };
    const result = buildType(param);
    expect(result).toEqual([
      {
        kind: "boolean",
        dependents: expect.any(Array),
        notAllowedElements: expect.any(Array),
        possibleValue: {
          fixed: expect.any(Boolean),
          values: expect.any(Array),
        },
        collection: false,
        reference: undefined,
      },
    ]);
  });

  it("should build PropertyType array for UI5Enum type", () => {
    const param = {
      context: createType<BindContext>({}),
      type: createType<UI5Type>({
        kind: "UI5Enum",
        name: "EnumType",
        fields: [{ name: "Field1" }],
      }),
      name: "testName",
      collection: false,
    };
    const result = buildType(param);
    expect(result).toEqual([
      {
        kind: "string",
        dependents: [],
        notAllowedElements: [],
        possibleValue: {
          fixed: true,
          values: ["Field1"],
        },
        collection: false,
        reference: undefined,
      },
    ]);
  });
  it("should build PropertyType array for UI5Enum type - [FilterOperator]", () => {
    const param = {
      context: createType<BindContext>({}),
      type: createType<UI5Type>({
        kind: "UI5Enum",
        name: "FilterOperator",
        fields: [{ name: "BT" }],
      }),
      name: "testName",
      collection: false,
    };
    const result = buildType(param);
    expect(result).toEqual([
      {
        kind: "string",
        dependents: [],
        notAllowedElements: [],
        possibleValue: {
          fixed: true,
          values: ["BT"],
        },
        collection: false,
        reference: undefined,
      },
    ]);
  });
  it("should build PropertyType array for UI5Typedef type", () => {
    const param = {
      context: createType<BindContext>({}),
      type: createType<UI5Type>({
        kind: "UI5Typedef",
        name: "string",
        properties: [],
      }),
      name: "testName",
      collection: false,
    };
    const result = buildType(param);
    expect(result).toEqual([
      {
        kind: "string",
        dependents: [],
        notAllowedElements: [],
        collection: false,
        reference: undefined,
      },
    ]);
  });

  it("should build PropertyType array for UI5Class type", () => {
    const param = {
      context: createType<BindContext>({ ui5Model: {} }),
      type: createType<UI5Type>({ kind: "UI5Class", name: "ClassType" }),
      name: "testName",
      collection: false,
    };
    const result = buildType(param);
    expect(result).toEqual([
      {
        kind: expect.any(String),
        dependents: [],
        notAllowedElements: [],
        possibleElements: [],
        possibleValue: {
          fixed: false,
          values: [],
        },
        collection: false,
        reference: undefined,
      },
    ]);
  });

  it("should build PropertyType array for UnionType", () => {
    const param = {
      context: createType<BindContext>({}),
      type: createType<UI5Type>({
        kind: "UnionType",
        types: [{ kind: "PrimitiveType", name: "Boolean" }],
      }),
      name: "testName",
      collection: false,
    };
    const result = buildType(param);
    expect(result).toEqual([
      {
        kind: "boolean",
        dependents: [],
        notAllowedElements: [],
        possibleValue: {
          fixed: true,
          values: [true, false],
        },
        collection: false,
        reference: undefined,
      },
    ]);
  });
  it("should build PropertyType array for UnionType - ArrayType", () => {
    const param = {
      context: createType<BindContext>({}),
      type: createType<UI5Type>({
        kind: "UnionType",
        types: [
          {
            kind: "ArrayType",
            type: { kind: "PrimitiveType", name: "Boolean" },
          },
        ],
      }),
      name: "testName",
      collection: false,
    };
    const result = buildType(param);
    expect(result).toEqual([
      {
        kind: "boolean",
        dependents: [],
        notAllowedElements: [],
        possibleValue: {
          fixed: true,
          values: [true, false],
        },
        collection: true,
        reference: undefined,
      },
    ]);
  });

  it("should build PropertyType array for ArrayType", () => {
    const param = {
      context: createType<BindContext>({}),
      type: createType<UI5Type>({
        kind: "ArrayType",
        type: { kind: "PrimitiveType", name: "Boolean" },
      }),
      name: "testName",
      collection: false,
    };
    const result = buildType(param);
    expect(result).toEqual([
      {
        kind: "boolean",
        dependents: [],
        notAllowedElements: [],
        possibleValue: {
          fixed: true,
          values: [true, false],
        },
        collection: true,
        reference: undefined,
      },
    ]);
  });
  it("should build PropertyType array for ArrayType - undefined type", () => {
    const param = {
      context: createType<BindContext>({}),
      type: createType<UI5Type>({
        kind: "ArrayType",
      }),
      name: "testName",
      collection: false,
    };
    const result = buildType(param);
    expect(result).toEqual([]);
  });
});

describe("getConstructorParameterProperties", () => {
  const mockContext = createType<BindContext>({
    ui5Model: {
      framework: OPEN_FRAMEWORK,
    },
  });

  const mockUI5Class = createType<UI5Class>({
    kind: "UI5Class",
    abstract: false,
    extends: undefined,
    implements: [],
    ctor: undefined,
    methods: [],
    properties: [],
    fields: [],
    aggregations: [],
    associations: [],
    events: [],
    defaultAggregation: undefined,
    returnTypes: [],
  });

  it("should return an empty array when parameterProperties is empty", () => {
    const result = getConstructorParameterProperties({
      context: mockContext,
      parameterProperties: [],
      type: mockUI5Class,
    });
    expect(result).toEqual([]);
  });

  it("should return an array of BindingInfoElement when parameterProperties contains valid data", () => {
    const mockParameterProperties: UI5ConstructorParameters[] = [
      {
        kind: "UI5TypedefProp",
        name: "param1",
        type: createType<UI5Type>({ kind: "PrimitiveType", name: "Boolean" }),
        parameterProperties: [],
      },
    ];

    const result = getConstructorParameterProperties({
      context: mockContext,
      parameterProperties: mockParameterProperties,
      type: mockUI5Class,
    });

    expect(result).toEqual([
      {
        name: "param1",
        type: [
          {
            kind: "boolean",
            dependents: [],
            notAllowedElements: [],
            possibleValue: {
              fixed: true,
              values: [true, false],
            },
            collection: false,
            reference: undefined,
          },
        ],
        documentation: {
          kind: "markdown",
          value:
            "`(class) `\n\n\n\n**undefined** Boolean\n\n**undefined** undefined\n\n**undefined** undefined\n\nundefined(https://sdk.openui5.org/#/api/)",
        },
        required: true,
      },
    ]);
  });

  it("should skip parameterProperties with missing type", () => {
    const mockParameterProperties: UI5ConstructorParameters[] = [
      {
        kind: "UI5TypedefProp",
        name: "param1",
        type: undefined,
        parameterProperties: [],
      },
    ];

    const result = getConstructorParameterProperties({
      context: mockContext,
      parameterProperties: mockParameterProperties,
      type: mockUI5Class,
    });

    expect(result).toEqual([]);
  });
});

describe("getPossibleElement", () => {
  const context = createType<BindContext>({
    ui5Model: {
      framework: OPEN_FRAMEWORK,
    },
  });

  it("should return sorter possible elements when type is Sorter and parameters are not defined - fallback", () => {
    const type = createType<UI5Class>({
      name: "Sorter",
      kind: "UI5Class",
      ctor: {},
    });
    const result = getPossibleElement({ context, type });

    expect(result).toMatchSnapshot();
  });

  it("should return constructor parameter properties for sorter when name is vSorterInfo", () => {
    const type = createType<UI5Class>({
      name: "Sorter",
      kind: "UI5Class",
      ctor: {
        parameters: [
          {
            name: "vSorterInfo",
            type: "someType",
            parameterProperties: [
              {
                kind: "UI5TypedefProp",
                name: "param1",
                type: createType<UI5Type>({
                  kind: "PrimitiveType",
                  name: "Boolean",
                }),
                parameterProperties: [],
              },
            ],
          },
          {
            name: "path",
            type: "string",
            parameterProperties: [],
          },
        ],
      },
    });
    const result = getPossibleElement({ context, type });

    expect(result).toMatchSnapshot();
  });

  it("should return filter possible elements when type is Filter and vFilterInfo is not defined - fallback", () => {
    const type = createType<UI5Class>({
      name: "Filter",
      kind: "UI5Class",
      ctor: {},
    });
    const result = getPossibleElement({ context, type });

    expect(result).toMatchSnapshot();
  });

  it("should return constructor parameter properties for filter when name is vFilterInfo", () => {
    const type = createType<UI5Class>({
      name: "Filter",
      kind: "UI5Class",
      ctor: {
        parameters: [
          {
            name: "vFilterInfo",
            type: "someType",
            parameterProperties: [
              {
                kind: "UI5TypedefProp",
                name: "value1",
                type: createType<UI5Type>({
                  kind: "PrimitiveType",
                  name: "Boolean",
                }),
                parameterProperties: [],
              },
            ],
          },
          {
            name: "path",
            type: "string",
            parameterProperties: [],
          },
        ],
      },
    });

    const result = getPossibleElement({ context, type });

    expect(result).toMatchSnapshot();
  });
});

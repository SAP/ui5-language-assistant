import {
  BindingInfoElement,
  BindingInfoName,
  TypeKind,
  Operator,
} from "../types";

export const getFiltersPossibleElement = (): BindingInfoElement[] => {
  return [
    {
      name: "path",
      type: [
        {
          kind: TypeKind.string,
          dependents: [],
          notAllowedElements: [],
        },
      ],
      documentation: {
        value: "",
        kind: "plaintext",
      },
    },
    {
      name: "test",
      type: [
        {
          kind: TypeKind.string,
          dependents: [],
          notAllowedElements: [],
        },
      ],
      documentation: {
        value: "",
        kind: "plaintext",
      },
    },
    {
      name: "comparator",
      type: [
        {
          kind: TypeKind.string,
          dependents: [],
          notAllowedElements: [],
        },
      ],
      documentation: {
        value: "",
        kind: "plaintext",
      },
    },
    {
      name: "operator",
      type: [
        {
          kind: TypeKind.string,
          possibleValue: {
            fixed: true,
            values: Object.values(Operator),
          },
          dependents: [],
          notAllowedElements: [],
        },
      ],
      documentation: {
        value: "",
        kind: "plaintext",
      },
    },
    {
      name: "value1",
      type: [
        {
          kind: TypeKind.any,
          dependents: [],
          notAllowedElements: [],
        },
      ],
      documentation: {
        value: "",
        kind: "plaintext",
      },
    },
    {
      name: "value2",
      type: [
        {
          kind: TypeKind.any,
          dependents: [],
          notAllowedElements: [],
        },
      ],
      documentation: {
        value: "",
        kind: "plaintext",
      },
    },
    {
      name: "variable",
      type: [
        {
          kind: TypeKind.any,
          dependents: [],
          notAllowedElements: [],
        },
      ],
      documentation: {
        value: "",
        kind: "plaintext",
      },
    },
    {
      name: "condition",
      type: [
        {
          kind: TypeKind.object,
          dependents: [],
          notAllowedElements: [],
          reference: "filters",
        },
      ],
      documentation: {
        value: "",
        kind: "plaintext",
      },
    },
    {
      name: "filters",
      type: [
        {
          kind: TypeKind.object,
          collection: true,
          dependents: [],
          notAllowedElements: [],
          reference: "filters",
        },
      ],
      documentation: {
        value: "",
        kind: "plaintext",
      },
    },
    {
      name: "and",
      type: [
        {
          kind: TypeKind.boolean,
          dependents: [],
          notAllowedElements: [],
        },
      ],
      documentation: {
        value: "",
        kind: "plaintext",
      },
    },
    {
      name: "caseSensitive",
      type: [
        {
          kind: TypeKind.boolean,
          dependents: [],
          notAllowedElements: [],
        },
      ],
      documentation: {
        value: "",
        kind: "plaintext",
      },
    },
  ];
};
export const filters: BindingInfoElement[] = [
  {
    name: BindingInfoName.filters,
    type: [
      {
        kind: TypeKind.object,
        collection: true,
        dependents: [],
        notAllowedElements: [],
        possibleElements: getFiltersPossibleElement(),
        possibleValue: {
          fixed: true,
          values: [],
        },
      },
    ],
    documentation: {
      value: "",
      kind: "plaintext",
    },
  },
];

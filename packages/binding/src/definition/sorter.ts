import { BindingInfoElement, BindingInfoName, TypeKind } from "../types";

export const getSorterPossibleElement = (): BindingInfoElement[] => {
  return [
    {
      name: "path",
      required: true,
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
      name: "descending",
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
      name: "group",
      type: [
        {
          kind: TypeKind.string,
          dependents: [],
          notAllowedElements: [],
        },
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
  ];
};
export const sorter: BindingInfoElement[] = [
  {
    name: BindingInfoName.sorter,
    type: [
      {
        kind: TypeKind.object,
        collection: false,
        dependents: [],
        notAllowedElements: [],
        possibleElements: getSorterPossibleElement(),
        possibleValue: {
          fixed: true,
          values: [],
        },
      },
      {
        kind: TypeKind.object,
        collection: true,
        dependents: [],
        notAllowedElements: [],
        possibleElements: getSorterPossibleElement(),
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

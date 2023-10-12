import { BindingInfoElement, BindingInfoName, TypeKind } from "../types";

/**
 * Currently [api.json](https://ui5.sap.com/1.118.1/test-resources/sap/ui/core/designtime/api.json) provides these constructor parameters as old school convention
 * e.g `sPath` for `path` where `s` stands for string type. These params are [map in runtime](https://github.com/SAP/openui5/blob/master/src/sap.ui.core/src/sap/ui/model/Sorter.js#L54-L60).
 * We build those param as machine readable format and reuse them for fallback and none-fallback scenario
 *
 * @Note UI5 Version 1.118.1 In the future, there might be new parameter introduced and hence adaption is needed
 */
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

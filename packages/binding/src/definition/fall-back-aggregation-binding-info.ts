import { BindingInfoName, TypeKind } from "../types";
import type { BindingInfoElement } from "../types";

export const aggregationBindingInfoElements: BindingInfoElement[] = [
  {
    name: BindingInfoName.events,
    type: [
      {
        kind: TypeKind.object,
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
    name: BindingInfoName.model,
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
    name: BindingInfoName.path,
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
    name: BindingInfoName.parameters,
    type: [
      {
        kind: TypeKind.object,
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
    name: BindingInfoName.suspended,
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
  // {
  //   name: BindingInfoName.factory,
  //   type: [
  //     {
  //       kind: TypeKind.string,
  //       dependents: [],
  //       notAllowedElements: [],
  //     },
  //   ],
  //   documentation: {
  //     value: "",
  //     kind: "plaintext",
  //   },
  // },
  // {
  //   name: BindingInfoName.groupHeaderFactory,
  //   type: [
  //     {
  //       kind: TypeKind.string,
  //       dependents: [],
  //       notAllowedElements: [],
  //     },
  //   ],
  //   documentation: {
  //     value: "",
  //     kind: "plaintext",
  //   },
  // },
  {
    name: BindingInfoName.key,
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
    name: BindingInfoName.startIndex,
    type: [
      {
        kind: TypeKind.integer,
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
    name: BindingInfoName.length,
    type: [
      {
        kind: TypeKind.integer,
        dependents: [],
        notAllowedElements: [],
      },
    ],
    documentation: {
      value: "",
      kind: "plaintext",
    },
  },
  // {
  //   name: BindingInfoName.template,
  //   type: [
  //     {
  //       kind: TypeKind.boolean,
  //       dependents: [],
  //       notAllowedElements: [],
  //     },
  //   ],
  //   documentation: {
  //     value: "",
  //     kind: "plaintext",
  //   },
  // },
  {
    name: BindingInfoName.templateShareable,
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
  // {
  //   name: BindingInfoName.filters,
  //   type: [
  //     {
  //       kind: TypeKind.string,
  //       dependents: [],
  //       notAllowedElements: [],
  //     },
  //   ],
  //   documentation: {
  //     value: "",
  //     kind: "plaintext",
  //   },
  // },
  // {
  // name: BindingInfoName.sorter,
  //   type: [
  //     {
  //       kind: TypeKind.string,
  //       dependents: [],
  //       notAllowedElements: [],
  //     },
  //   ],
  //   documentation: {
  //     value: "",
  //     kind: "plaintext",
  //   },
  // },
];

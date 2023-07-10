import type { PropertyBindingInfoElement } from "../types";
import { BindingInfoName, TypeKind } from "../types";
/**
 * In some of UI5 versions e.g "1.71.49", `api.json` does not contain `typedefs` for `PropertyBindingInfo`. Therefore provides a fallback
 * to support basic code completion and diagnostics. Once `api.json` is enhanced to include `typedefs` for `PropertyBindingInfo` for all LTS of UI5 versions, this fallback can be
 * completely deleted
 */
export const fallBackElements: PropertyBindingInfoElement[] = [
  {
    name: BindingInfoName.path,
    type: [
      {
        kind: TypeKind.string,
        dependents: [],
        notAllowedElements: [BindingInfoName.value, BindingInfoName.parts],
      },
    ],
    documentation: {
      value: "",
      kind: "plaintext",
    },
  },
  {
    name: BindingInfoName.value,
    type: [
      {
        kind: TypeKind.string,
        dependents: [],
        notAllowedElements: [BindingInfoName.path, BindingInfoName.parts],
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
  {
    name: BindingInfoName.formatter,
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
    name: BindingInfoName.useRawValues,
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
    name: BindingInfoName.useInternalValues,
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
    name: BindingInfoName.type,
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
    name: BindingInfoName.targetType,
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
    name: BindingInfoName.formatOptions,
    type: [
      {
        kind: TypeKind.object,
        dependents: [
          {
            name: BindingInfoName.type,
            type: [
              {
                kind: TypeKind.string,
                dependents: [],
                notAllowedElements: [],
              },
            ],
          },
        ],
        notAllowedElements: [],
      },
    ],
    documentation: {
      value: "",
      kind: "plaintext",
    },
  },
  {
    name: BindingInfoName.constraints,
    type: [
      {
        kind: TypeKind.object,
        dependents: [
          {
            name: BindingInfoName.type,
            type: [
              {
                kind: TypeKind.string,
                dependents: [],
                notAllowedElements: [],
              },
            ],
          },
        ],
        notAllowedElements: [],
      },
    ],
    documentation: {
      value: "",
      kind: "plaintext",
    },
  },
  {
    name: BindingInfoName.mode,
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
    name: BindingInfoName.parts,
    type: [
      {
        kind: TypeKind.string,
        dependents: [],
        collection: true,
        notAllowedElements: [],
      },
      {
        kind: TypeKind.object,
        dependents: [],
        notAllowedElements: [BindingInfoName.path, BindingInfoName.value],
        collection: true,
      },
    ],
    documentation: {
      value: "",
      kind: "plaintext",
    },
  },
];

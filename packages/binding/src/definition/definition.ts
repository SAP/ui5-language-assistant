import type { PropertyBindingInfoElement } from "../types";
export const propertyBindingInfoElements: PropertyBindingInfoElement[] = [
  {
    name: "path",
    type: [
      {
        kind: "string",
        dependents: [],
        notAllowedElements: ["value", "parts"],
      },
    ],
    description: {
      text: `Path in the model to bind to, either an absolute path or relative to the binding context for the corresponding model; when the path contains a '>' sign, the string preceding it will override the model property and the remainder after the '>' will be used as binding path`,
      visibility: "Public",
    },
  },
  {
    name: "value",
    type: [
      {
        kind: "string",
        dependents: [],
        notAllowedElements: ["path", "parts"],
      },
    ],
    description: {
      text: "Since 1.61, defines a static binding with the given value",
      visibility: "Public",
    },
  },
  {
    name: "model",
    type: [
      {
        kind: "string",
        dependents: [],
        notAllowedElements: [],
      },
    ],
    description: {
      text: "Name of the model to bind against; when undefined or omitted, the default model is used",
      visibility: "Public",
    },
  },
  {
    name: "suspended",
    type: [
      {
        kind: "boolean",
        dependents: [],
        notAllowedElements: [],
      },
    ],
    description: {
      text: "Whether the binding should be suspended initially",
      visibility: "Public",
    },
  },
  {
    name: "formatter",
    type: [
      {
        kind: "string",
        dependents: [],
        notAllowedElements: [],
      },
    ],
    description: {
      text: "Function to convert model data into a property value",
      visibility: "Public",
    },
  },
  {
    name: "useRawValues",
    type: [
      {
        kind: "boolean",
        dependents: [],
        notAllowedElements: [],
      },
    ],
    description: {
      text: `Whether the parameters to the formatter function should be passed as raw values. In this case the specified types for the binding parts are not used and the values are not formatted.
**Note**: use this flag only when using multiple bindings. If you use only one binding and want raw values then simply don't specify a type for that binding`,
      visibility: "Public",
    },
  },
  {
    name: "useInternalValues",
    type: [
      {
        kind: "boolean",
        dependents: [],
        notAllowedElements: [],
      },
    ],
    description: {
      text: `Whether the parameters to the formatter function should be passed as the related JavaScript primitive values. In this case the values of the model are parsed by the model format of the specified types from the binding parts.
**Note**: use this flag only when using multiple bindings.`,
      visibility: "Public",
    },
  },
  {
    name: "type",
    type: [
      {
        kind: "object",
        dependents: [],
        notAllowedElements: [],
      },
      {
        kind: "string",
        dependents: [],
        notAllowedElements: [],
      },
    ],
    description: {
      text: `A type object or the name of a type class to create such a type object; the type will be used for converting model data to a property value (aka "formatting") and vice versa (in binding mode TwoWay, aka "parsing")`,
      visibility: "Public",
    },
  },
  {
    name: "targetType",
    type: [
      {
        kind: "string",
        dependents: [],
        notAllowedElements: [],
      },
    ],
    description: {
      text: `Target type to be used by the type when formatting model data, for example "boolean" or "string" or "any"; defaults to the property's type`,
      visibility: "Public",
    },
  },
  {
    name: "formatOptions",
    type: [
      {
        kind: "object",
        dependents: [
          {
            name: "type",
            type: [
              {
                kind: "string",
                dependents: [],
                notAllowedElements: [],
              },
            ],
          },
        ],
        notAllowedElements: [],
      },
    ],
    description: {
      text: `Format options to be used for the type; only taken into account when the type is specified by its name - a given type object won't be modified`,
      visibility: "Public",
    },
  },
  {
    name: "constraints",
    type: [
      {
        kind: "object",
        dependents: [
          {
            name: "type",
            type: [
              {
                kind: "string",
                dependents: [],
                notAllowedElements: [],
              },
            ],
          },
        ],
        notAllowedElements: [],
      },
    ],
    description: {
      text: `Additional constraints to be used when constructing a type object from a type name, ignored when a type object is given`,
      visibility: "Public",
    },
  },
  {
    name: "mode",
    type: [
      {
        kind: "object",
        dependents: [],
        notAllowedElements: [],
      },
    ],
    description: {
      text: "Binding mode to be used for this property binding (e.g. one way)",
      visibility: "Public",
    },
  },
  {
    name: "parameters",
    type: [
      {
        kind: "object",
        dependents: [],
        notAllowedElements: [],
      },
    ],
    description: {
      text: `Map of additional parameters for this binding; the names and value ranges of the supported parameters depend on the model implementation, they should be documented with the bindProperty method of the corresponding model class or with the model specific subclass of sap.ui.model.PropertyBinding`,
      visibility: "Public",
    },
  },
  {
    name: "events",
    type: [
      {
        kind: "object",
        dependents: [],
        notAllowedElements: [],
      },
    ],
    description: {
      text: "Map of event handler functions keyed by the name of the binding events that they should be attached to",
      visibility: "Public",
    },
  },
  {
    name: "parts",
    type: [
      {
        kind: "object",
        dependents: [],
        notAllowedElements: ["path", "value"],
        collection: true,
      },
      {
        kind: "string",
        dependents: [],
        collection: true,
        notAllowedElements: [],
      },
    ],
    description: {
      text: `Array of binding info objects for the parts of a composite binding; the structure of each binding info is the same as described for the oBindingInfo as a whole.
If a part is not specified as a binding info object but as a simple string, a binding info object will be created with that string as path. The string may start with a model name prefix (see property path).
**Note**: recursive composite bindings are currently not supported. Therefore, a part must not contain a parts property`,
      visibility: "Public",
    },
  },
];

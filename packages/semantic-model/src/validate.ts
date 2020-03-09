import { Json } from "../api";
import { LibraryFile } from "./apiJson";
import { error } from "./utils";
import { isArray, isPlainObject, isEmpty, keys, difference } from "lodash";

type BaseType = "string" | "boolean" | "number";
type ObjectType = { [key: string]: PropertyType };
type PropertyType = BaseType | ObjectType | [PropertyType] | undefined;

const METADATA_PROPS: ObjectType = {
  static: "boolean",
  visibility: "string",
  description: "string",
  since: "string",
  deprecated: {
    since: "string",
    text: "string"
  },
  experimental: {
    since: "string",
    text: "string"
  },
  examples: [
    {
      caption: "string",
      text: "string"
    }
  ],
  references: ["string"]
};
const SYMBOL_PROPS: ObjectType = {
  ...METADATA_PROPS,
  kind: "string",
  name: "string",
  basename: "string",
  resource: "string",
  module: "string",
  export: "string",
  "ui5-metamodel": "boolean"
};
const KNOWN_PROPS_MAP: Record<string, ObjectType> = {
  namespace: {
    ...SYMBOL_PROPS,
    final: "boolean",
    "ui5-metadata": undefined,
    properties: [undefined],
    methods: [undefined],
    references: ["string"],
    events: [undefined],
    abstract: "boolean",
    extends: "string",
    examples: [
      {
        caption: "string",
        text: "string"
      }
    ]
  },
  class: {
    ...SYMBOL_PROPS,
    final: "boolean",
    "ui5-metadata": {
      stereotype: "string",
      metadataClass: "string",
      properties: [undefined],
      defaultProperty: "string",
      aggregations: [undefined],
      defaultAggregation: "string",
      associations: [undefined],
      events: [
        {
          ...METADATA_PROPS,
          name: "string",
          parameters: undefined,
          methods: [undefined]
        }
      ],
      designtime: "string",
      specialSettings: [undefined],
      dnd: {
        draggable: "boolean",
        droppable: "boolean"
      }
    },
    extends: "string",
    constructor: undefined,
    events: [
      {
        ...METADATA_PROPS,
        name: "string",
        parameters: [undefined],
        module: "string",
        resource: "string"
      }
    ],
    methods: [undefined],
    implements: ["string"],
    abstract: "boolean",
    properties: [undefined]
  },
  enum: {
    ...SYMBOL_PROPS,
    "ui5-metadata": {
      stereotype: "string"
    },
    references: ["string"],
    properties: [undefined]
  },
  interface: {
    ...SYMBOL_PROPS,
    methods: [undefined],
    events: [undefined]
  },
  function: {
    ...SYMBOL_PROPS,
    parameters: [
      {
        name: "string",
        type: "string",
        optional: "boolean",
        description: "string",
        defaultValue: undefined,
        parameterProperties: undefined // This is a map recursive property, it cannot be validated with this limited type system
      }
    ],
    returnValue: {
      type: "string",
      description: "string"
    },
    throws: [
      {
        type: "string",
        description: "string"
      }
    ]
  },
  typedef: {
    ...SYMBOL_PROPS,
    properties: [undefined],
    parameters: [undefined],
    returnValue: {
      type: "string",
      description: "string"
    }
  }
};

export function isLibraryFile(
  fileName: string,
  fileContent: Json,
  strict: boolean
): fileContent is LibraryFile {
  if (!isPlainObject(fileContent)) {
    return false;
  }
  const fileContentObj = fileContent as Record<string, unknown>;

  if (typeof fileContentObj["$schema-ref"] !== "string") {
    error(`${fileName}: $schema-ref is not a string`, false);
    // This error is not critical since we don't use this field
    if (strict) {
      return false;
    }
  }
  if (typeof fileContentObj.version !== "string") {
    error(`${fileName}: version is not a string`, false);
    // This error is not critical since we don't use this field
    if (strict) {
      return false;
    }
  }
  if (
    fileContentObj.library !== undefined &&
    typeof fileContentObj.library !== "string"
  ) {
    error(`${fileName}: version is not a string`, false);
    // This error is not critical since we don't use this field
    if (strict) {
      return false;
    }
  }

  if (!isArray(fileContentObj.symbols)) {
    error(`${fileName}: symbols is not an array`, false);
    return false;
  }

  let allSymbolsAreValid = true;
  const unknownSymbolKinds: Record<string, boolean> = {};
  for (const symbol of fileContentObj.symbols) {
    if (!KNOWN_PROPS_MAP[symbol.kind]) {
      unknownSymbolKinds[symbol.kind] = true;
      continue;
    }
    allSymbolsAreValid =
      allSymbolsAreValid &&
      isValidObject(
        symbol.name,
        symbol.kind,
        symbol,
        KNOWN_PROPS_MAP[symbol.kind],
        strict
      );
  }
  if (!isEmpty(unknownSymbolKinds)) {
    error(
      `${fileName}: unknown symbol kinds ${JSON.stringify(
        Object.keys(unknownSymbolKinds)
      )}`,
      false
    );
    if (strict) {
      return false;
    }
  }
  return allSymbolsAreValid;
}
// Exported for testing purpose
export function isValidValue(
  symbolFQN: string,
  typeFQN: string,
  value: unknown,
  valueType: PropertyType,
  strict: boolean
): boolean {
  // Undefined valueType means don't validate. We also don't validate if value is undefined because some properties are optional.
  if (valueType !== undefined && value !== undefined) {
    if (typeof valueType === "string") {
      if (typeof value !== valueType) {
        error(
          `${symbolFQN}: unexpected value ${value}, expected value of type ${valueType}`,
          false
        );
        return !strict;
      }
    } else if (isArray(valueType)) {
      if (!isArray(value)) {
        error(`${symbolFQN}: unexpected value ${value}, expected array`, false);
        return !strict;
      }
      return isValidArray(symbolFQN, typeFQN, value, valueType, strict);
    } else if (isObjectType(valueType)) {
      if (!isPlainObject(value)) {
        error(
          `${symbolFQN}: unexpected value ${value}, expected object`,
          false
        );
        return !strict;
      }
      return isValidObject(
        symbolFQN,
        typeFQN,
        value as Record<string, unknown>,
        valueType,
        strict
      );
    } else {
      // Basically this cannot happen because typescript validates it (the type of valueType is never) but it's needed for coverage
      error(`Unexpected value type ${valueType}`, true);
    }
  }
  return true;
}

function isObjectType(valueType: PropertyType): valueType is ObjectType {
  return isPlainObject(valueType);
}

function isValidObject(
  symbolFQN: string,
  typeFQN: string,
  symbol: Record<string, unknown>,
  type: ObjectType,
  strict: boolean
): boolean {
  const objProps = keys(symbol);
  const unexpectedProps = difference(objProps, Object.keys(type));

  if (!isEmpty(unexpectedProps)) {
    error(
      `Unexpected properties for object ${symbolFQN} of type ${typeFQN}: ${JSON.stringify(
        unexpectedProps
      )}`,
      false
    );
    if (strict) {
      return false;
    }
  }

  let valueIsValid = true;
  for (const prop in symbol) {
    const value = symbol[prop];
    const expectedValueType = type[prop];
    valueIsValid =
      valueIsValid &&
      isValidValue(
        `${symbolFQN}.${prop}`,
        `${typeFQN}.${prop}`,
        value,
        expectedValueType,
        strict
      );
  }
  return valueIsValid;
}

function isValidArray(
  symbolFQN: string,
  typeFQN: string,
  symbol: unknown[],
  valueType: [PropertyType],
  strict: boolean
): boolean {
  const itemType = valueType[0];
  let valueIsValid = true;
  for (let i = 0; i < symbol.length; ++i) {
    const value = symbol[i];
    valueIsValid =
      valueIsValid &&
      isValidValue(`${symbolFQN}[${i}]`, typeFQN, value, itemType, strict);
  }
  return valueIsValid;
}

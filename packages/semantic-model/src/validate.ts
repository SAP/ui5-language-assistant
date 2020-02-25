import { Json } from "../api";
import { LibraryFile } from "./apiJson";
import { error } from "./utils";
import { isArray, isPlainObject, isEmpty, keys, difference } from "lodash";

type BaseType = "string" | "boolean" | "number";
type ObjectType = { [key: string]: PropertyType };
type PropertyType = BaseType | ObjectType | [PropertyType] | undefined;
const KNOWN_PROPS_MAP: Record<string, ObjectType> = {
  namespace: {
    kind: "string",
    name: "string",
    basename: "string",
    resource: "string",
    module: "string",
    export: "string",
    static: "boolean",
    visibility: "string",
    description: "string",
    since: "string",
    "ui5-metamodel": "boolean",
    "ui5-metadata": undefined,
    properties: [undefined],
    methods: [undefined],
    references: ["string"],
    final: "boolean",
    deprecated: {
      since: "string",
      text: "string"
    },
    events: [undefined],
    abstract: "boolean",
    extends: "string",
    experimental: {
      since: "string",
      text: "string"
    },
    examples: [
      {
        caption: "string",
        text: "string"
      }
    ]
  },
  class: {
    kind: "string",
    name: "string",
    basename: "string",
    resource: "string",
    module: "string",
    export: "string",
    "ui5-metamodel": "boolean",
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
    "ui5-metadata": undefined,
    extends: "string",
    constructor: undefined,
    events: [undefined],
    methods: [undefined],
    implements: [undefined],
    abstract: "boolean",
    properties: [undefined],
    final: "boolean"
  },
  enum: {
    kind: "string",
    name: "string",
    basename: "string",
    resource: "string",
    module: "string",
    export: "string",
    static: "boolean",
    visibility: "string",
    description: "string",
    since: "string",
    "ui5-metamodel": "boolean",
    "ui5-metadata": {
      stereotype: "string"
    },
    deprecated: {
      since: "string",
      text: "string"
    },
    experimental: {
      since: "string",
      text: "string"
    },
    references: ["string"],
    properties: [undefined]
  },
  interface: {
    kind: "string",
    name: "string",
    basename: "string",
    resource: "string",
    module: "string",
    export: "string",
    static: "boolean",
    visibility: "string",
    description: "string",
    since: "string",
    "ui5-metamodel": "boolean",
    deprecated: {
      since: "string",
      text: "string"
    },
    experimental: {
      since: "string",
      text: "string"
    },
    references: ["string"],
    methods: [undefined],
    events: [undefined]
  },
  function: {
    kind: "string",
    name: "string",
    basename: "string",
    resource: "string",
    module: "string",
    export: "string",
    visibility: "string",
    description: "string",
    since: "string",
    examples: [
      {
        caption: "string",
        text: "string"
      }
    ],
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
    kind: "string",
    name: "string",
    basename: "string",
    resource: "string",
    module: "string",
    export: "string",
    static: "boolean",
    visibility: "string",
    description: "string",
    since: "string",
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
  /* istanbul ignore if */
  if (!isPlainObject(fileContent)) {
    return false;
  }
  const fileContentObj = fileContent as Record<string, unknown>;

  /* istanbul ignore if */
  if (typeof fileContentObj["$schema-ref"] !== "string") {
    error(`${fileName}: $schema-ref is not a string`, false);
    // This error is not critical since we don't use this field
    if (strict) {
      return false;
    }
  }
  /* istanbul ignore if */
  if (typeof fileContentObj.version !== "string") {
    error(`${fileName}: version is not a string`, false);
    // This error is not critical since we don't use this field
    if (strict) {
      return false;
    }
  }
  /* istanbul ignore if */
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

  /* istanbul ignore if */
  if (!isArray(fileContentObj.symbols)) {
    error(`${fileName}: symbols is not an array`, false);
    return false;
  }

  let allSymbolsAreValid = true;
  const unknownSymbolKinds: Record<string, boolean> = {};
  for (const symbol of fileContentObj.symbols) {
    /* istanbul ignore if */
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
  /* istanbul ignore if */
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

function isValidValue(
  symbolFQN: string,
  typeFQN: string,
  value: unknown,
  valueType: PropertyType,
  strict: boolean
): boolean {
  // Undefined means don't validate. We also don't validate undefined values because some properties are optional.
  if (valueType !== undefined && value !== undefined) {
    if (typeof valueType === "string") {
      /* istanbul ignore if */
      if (typeof value !== valueType) {
        error(
          `${symbolFQN}: unexpected value ${value}, expected value of type ${valueType}`,
          false
        );
        return !strict;
      }
    } else if (isArray(valueType)) {
      /* istanbul ignore if */
      if (!isArray(value)) {
        error(`${symbolFQN}: unexpected value ${value}, expected array`, false);
        return !strict;
      }
      return isValidArray(symbolFQN, typeFQN, value, valueType, strict);
    } /* istanbul ignore else */ else if (isPlainObject(valueType)) {
      /* istanbul ignore if */
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
      error(`Unexpected value type ${valueType}`, false);
      return !strict;
    }
  }
  return true;
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

  /* istanbul ignore if */
  if (!isEmpty(unexpectedProps)) {
    error(
      `Unexpected properties for object ${
        symbol.name
      } of kind ${typeFQN}: ${JSON.stringify(unexpectedProps)}`,
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

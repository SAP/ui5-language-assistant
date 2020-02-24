import * as model from "@vscode-ui5/semantic-model-types";
import { Json } from "../api";
import * as apiJson from "./apiJson";
import { verifyLibraryFileSchema } from "./validate";
import { error, newMap } from "./utils";
import {
  map,
  merge,
  reduce,
  has,
  partial,
  sortBy,
  cloneDeep,
  isArray,
  isFunction
} from "lodash";

export function convertToSemanticModel(
  libraries: Record<string, Json>,
  jsonSymbols: Record<string, apiJson.Symbol>,
  strict: boolean
): model.UI5SemanticModel {
  const model: model.UI5SemanticModel = {
    version: "",
    classes: newMap(),
    enums: newMap(),
    functions: newMap(),
    namespaces: newMap(),
    typedefs: newMap(),
    interfaces: newMap()
  };

  // Convert to array (with deterministic order) to ensure consistency when inserting to maps
  const libsArray = map(libraries, (fileContent, libraryName) => ({
    libraryName,
    fileContent
  }));
  const sortedLibs = sortBy(libsArray, "libraryName");

  reduce(
    sortedLibs,
    (model, { libraryName, fileContent }) => {
      const lib = verifyLibraryFileSchema(libraryName, fileContent, strict);
      const libSemanticModel = convertLibraryToSemanticModel(
        libraryName,
        lib,
        jsonSymbols,
        strict
      );
      addLibraryToModel(libSemanticModel, model);
      return model;
    },
    model
  );

  return model;
}

function addLibraryToModel(
  library: model.UI5SemanticModel,
  model: model.UI5SemanticModel
): void {
  merge(model, library);
}

function convertLibraryToSemanticModel(
  libName: string,
  lib: apiJson.LibraryFile,
  jsonSymbols: Record<string, apiJson.Symbol>,
  strict: boolean
): model.UI5SemanticModel {
  const model: model.UI5SemanticModel = {
    version: lib.version,
    classes: newMap(),
    interfaces: newMap(),
    enums: newMap(),
    functions: newMap(),
    namespaces: newMap(),
    typedefs: newMap()
  };
  for (const symbol of lib.symbols) {
    const fqn = symbol.name;
    /* istanbul ignore if */
    if (has(jsonSymbols, fqn)) {
      error(
        `${libName} Duplicate symbol found: ${symbol.kind} ${fqn}. First occurrence is a ${jsonSymbols[fqn].kind}`,
        strict
      );
      continue;
    }
    jsonSymbols[fqn] = symbol;
    switch (symbol.kind) {
      case "namespace": {
        model.namespaces[fqn] = convertNamespace(libName, symbol);
        break;
      }
      case "class": {
        model.classes[fqn] = convertClass(libName, symbol);
        break;
      }
      case "enum": {
        model.enums[fqn] = convertEnum(libName, symbol);
        break;
      }
      case "function": {
        model.functions[fqn] = convertFunction(libName, symbol);
        break;
      }
      case "interface": {
        model.interfaces[fqn] = convertInterface(libName, symbol);
        break;
      }
      case "typedef": {
        model.typedefs[fqn] = convertTypedef(libName, symbol);
        break;
      }
    }
  }
  return model;
}

function convertNamespace(
  libName: string,
  symbol: apiJson.Namespace
): model.UI5Namespace {
  const base = convertSymbol(libName, symbol);
  const namespace: model.UI5Namespace = {
    ...base,
    kind: "UI5Namespace",
    fields: [],
    methods: [],
    events: [],
    namespaces: newMap(),
    classes: newMap()
  };

  namespace.methods = map(
    symbol.methods,
    partial(convertMethod, libName, namespace)
  );
  namespace.fields = map(
    symbol.properties,
    partial(convertField, libName, namespace)
  );
  namespace.events = map(
    symbol.events,
    partial(convertEvent, libName, namespace)
  );

  return namespace;
}

function convertClass(libName: string, symbol: apiJson.Class): model.UI5Class {
  const base = convertSymbol(libName, symbol);
  const classs: model.UI5Class = {
    ...base,
    kind: "UI5Class",
    ctor: undefined,
    extends: undefined, // Filled later
    implements: [], // Filled later
    aggregations: [],
    associations: [],
    events: [],
    methods: [],
    properties: [],
    defaultAggregation: undefined // Filled later
  };

  if (symbol["ui5-metadata"] !== undefined) {
    classs.aggregations = map(symbol["ui5-metadata"].aggregations, _ =>
      convertAggregation(libName, _, classs)
    );
    classs.associations = map(symbol["ui5-metadata"].associations, _ =>
      convertAssociation(libName, _, classs)
    );
  }
  // Due to unfortunate naming, if not defined in the json, symbol.constructor will be a javascript function
  classs.ctor =
    symbol.constructor === undefined || isFunction(symbol.constructor)
      ? undefined
      : convertConstructor(
          libName,
          classs,
          symbol.constructor as apiJson.Constructor
        );
  classs.events = map(symbol.events, partial(convertEvent, libName, classs));
  classs.methods = map(symbol.methods, partial(convertMethod, libName, classs));
  classs.properties = map(
    symbol.properties,
    partial(convertProperty, libName, classs)
  );

  return classs;
}

function convertInterface(
  libName: string,
  symbol: apiJson.Interface
): model.UI5Interface {
  const base = convertSymbol(libName, symbol);
  const interfacee: model.UI5Interface = {
    ...base,
    kind: "UI5Interface",
    events: [],
    methods: []
  };

  interfacee.events = map(
    symbol.events,
    partial(convertEvent, libName, interfacee)
  );
  interfacee.methods = map(
    symbol.methods,
    partial(convertMethod, libName, interfacee)
  );

  return interfacee;
}

function convertFunction(
  libName: string,
  symbol: apiJson.FunctionSymbol
): model.UI5Function {
  const base = convertSymbol(libName, symbol);
  const func: model.UI5Function = {
    ...base,
    kind: "UI5Function"
  };
  return func;
}

function convertEnum(libName: string, symbol: apiJson.Enum): model.UI5Enum {
  const base = convertSymbol(libName, symbol);
  const enumm: model.UI5Enum = {
    ...base,
    kind: "UI5Enum",
    fields: []
  };

  enumm.fields = map(
    symbol.properties,
    partial(convertEnumValue, libName, enumm)
  );

  return enumm;
}

function convertTypedef(
  libName: string,
  symbol: apiJson.Typedef
): model.UI5Typedef {
  const base = convertSymbol(libName, symbol);
  const typedef: model.UI5Typedef = {
    ...base,
    kind: "UI5Typedef"
  };
  return typedef;
}

function convertMeta(
  libName: string,
  jsonMeta: apiJson.Metadata
): model.UI5Meta {
  const meta: model.UI5Meta = {
    library: libName,
    description: jsonMeta.description,
    since: jsonMeta.since,
    deprecatedInfo: jsonMeta.deprecated
      ? {
          isDeprecated: true,
          since: jsonMeta.deprecated.since ?? undefined,
          text: jsonMeta.deprecated.text ?? undefined
        }
      : undefined,
    visibility: jsonMeta.visibility
  };
  return meta;
}

function convertSymbol(
  libName: string,
  jsonSymbol: apiJson.Symbol
): model.BaseUI5Node {
  const meta = convertMeta(libName, jsonSymbol);
  const baseNode: model.BaseUI5Node = {
    ...meta,
    kind: "",
    name: jsonSymbol.basename,
    parent: undefined // Filled later (during resolve)
  };
  return baseNode;
}

function convertConstructor(
  libName: string,
  parent: model.BaseUI5Node,
  jsonConstructor: apiJson.Constructor
): model.UI5Constructor {
  const meta = convertMeta(libName, jsonConstructor);
  const constructor: model.UI5Constructor = {
    kind: "UI5Constructor",
    ...meta,
    name: "",
    parent: parent
  };
  return constructor;
}

function convertMethod(
  libName: string,
  parent: model.BaseUI5Node,
  jsonMethod: apiJson.Method
): model.UI5Method {
  const meta = convertMeta(libName, jsonMethod);
  const method: model.UI5Method = {
    kind: "UI5Method",
    ...meta,
    name: jsonMethod.name,
    parent: parent
  };
  return method;
}

function convertField(
  libName: string,
  parent: model.BaseUI5Node,
  jsonProperty: apiJson.Property
): model.UI5Field {
  const meta = convertMeta(libName, jsonProperty);
  const field: model.UI5Field = {
    kind: "UI5Field",
    ...meta,
    name: jsonProperty.name,
    parent: parent,
    type: {
      kind: "UnresolvedType",
      type: jsonProperty.type
    }
  };
  return field;
}

function convertProperty(
  libName: string,
  parent: model.BaseUI5Node,
  jsonProperty: apiJson.Property
): model.UI5Prop {
  const meta = convertMeta(libName, jsonProperty);
  const property: model.UI5Prop = {
    kind: "UI5Prop",
    ...meta,
    name: jsonProperty.name,
    parent: parent,
    type: {
      kind: "UnresolvedType",
      type: jsonProperty.type
    },
    default: cloneDeep(jsonProperty.defaultValue)
  };
  return property;
}

function convertEnumValue(
  libName: string,
  parent: model.UI5Enum,
  jsonProperty: apiJson.Property
): model.UI5EnumValue {
  const meta = convertMeta(libName, jsonProperty);
  const enumValue: model.UI5EnumValue = {
    kind: "UI5EnumValue",
    ...meta,
    name: jsonProperty.name,
    parent: parent
  };
  return enumValue;
}

function convertAggregation(
  libName: string,
  jsonAggregation: apiJson.Aggregation,
  parent: model.UI5Class
): model.UI5Aggregation {
  const meta = convertMeta(libName, jsonAggregation);
  const aggregation: model.UI5Aggregation = {
    kind: "UI5Aggregation",
    ...meta,
    name: jsonAggregation.name,
    parent: parent,
    type: {
      kind: "UnresolvedType",
      type: jsonAggregation.type
    },
    altTypes: isArray(jsonAggregation.altTypes)
      ? map(jsonAggregation.altTypes, _ => ({
          kind: "UnresolvedType",
          type: _
        }))
      : [],
    cardinality: jsonAggregation.cardinality
  };
  return aggregation;
}

function convertAssociation(
  libName: string,
  jsonAssociation: apiJson.Association,
  parent: model.UI5Class
): model.UI5Association {
  const meta = convertMeta(libName, jsonAssociation);
  const association: model.UI5Association = {
    kind: "UI5Association",
    ...meta,
    name: jsonAssociation.name,
    parent: parent,
    type: {
      kind: "UnresolvedType",
      type: jsonAssociation.type
    },
    cardinality: jsonAssociation.cardinality
  };
  return association;
}

function convertEvent(
  libName: string,
  parent: model.BaseUI5Node,
  jsonEvent: apiJson.Event
): model.UI5Event {
  const meta = convertMeta(libName, jsonEvent);
  const event: model.UI5Event = {
    kind: "UI5Event",
    ...meta,
    name: jsonEvent.name,
    parent: parent
  };
  return event;
}

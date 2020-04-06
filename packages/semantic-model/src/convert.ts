import * as model from "@ui5-language-assistant/semantic-model-types";
import { Json } from "../api";
import * as apiJson from "./api-json";
import { isLibraryFile } from "./validate";
import { error, hasProperty, newMap } from "./utils";
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
  jsonSymbols: Record<string, apiJson.ConcreteSymbol>,
  strict: boolean,
  printValidationErrors: boolean
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
      if (
        isLibraryFile(libraryName, fileContent, strict, printValidationErrors)
      ) {
        const libSemanticModel = convertLibraryToSemanticModel(
          libraryName,
          fileContent,
          jsonSymbols,
          strict
        );
        addLibraryToModel(libSemanticModel, model);
      } else if (strict) {
        throw new Error(`Entry for ${libraryName} is not a valid library file`);
      }
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
  lib: apiJson.SchemaForApiJsonFiles,
  jsonSymbols: Record<string, apiJson.ConcreteSymbol>,
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
  if (lib.symbols === undefined) {
    return model;
  }
  for (const symbol of lib.symbols) {
    const fqn = symbol.name;
    if (has(jsonSymbols, fqn)) {
      error(
        `${libName}: Duplicate symbol found: ${symbol.kind} ${fqn}. First occurrence is a ${jsonSymbols[fqn].kind}.`,
        strict
      );
      continue;
    }
    jsonSymbols[fqn] = symbol;
    // For some reason we get a non-reachable case branch here on all cases except "typedef", although it's not correct
    // noinspection JSUnreachableSwitchBranches
    switch (symbol.kind) {
      case "namespace": // Fallthrough
      case "member": {
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
  symbol: apiJson.NamespaceSymbol | apiJson.DatatypeSymbol
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

function convertClass(
  libName: string,
  symbol: apiJson.ClassSymbol
): model.UI5Class {
  const base = convertSymbol(libName, symbol);
  const clazz: model.UI5Class = {
    ...base,
    kind: "UI5Class",
    abstract: symbol.abstract ?? false,
    ctor: undefined,
    extends: undefined, // Filled later
    implements: [], // Filled later
    aggregations: [],
    associations: [],
    events: [],
    methods: [],
    properties: [],
    fields: [],
    defaultAggregation: undefined // Filled later
  };

  if (symbol["ui5-metadata"] !== undefined) {
    clazz.aggregations = map(symbol["ui5-metadata"].aggregations, _ =>
      convertAggregation(libName, _, clazz)
    );
    clazz.associations = map(symbol["ui5-metadata"].associations, _ =>
      convertAssociation(libName, _, clazz)
    );
    clazz.properties = map(
      symbol["ui5-metadata"].properties,
      partial(convertProperty, libName, clazz)
    );
  }
  // Due to unfortunate naming, if not defined in the json, symbol.constructor will be a javascript function
  clazz.ctor =
    symbol.constructor === undefined || isFunction(symbol.constructor)
      ? undefined
      : convertConstructor(libName, clazz, symbol.constructor);
  clazz.events = map(symbol.events, partial(convertEvent, libName, clazz));
  clazz.methods = map(symbol.methods, partial(convertMethod, libName, clazz));
  // The "properties" directly under the class symbol are displayed as "fields" in the SDK and are not considered properties
  clazz.fields = map(
    symbol.properties,
    partial(convertProperty, libName, clazz)
  );

  return clazz;
}

function convertInterface(
  libName: string,
  symbol: apiJson.InterfaceSymbol
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

function convertEnum(
  libName: string,
  symbol: apiJson.EnumSymbol
): model.UI5Enum {
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
  symbol: apiJson.TypedefSymbol
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
  jsonMeta:
    | apiJson.SymbolBase
    | apiJson.ObjProperty
    | apiJson.ObjMethod
    | apiJson.ObjEvent
    | apiJson.EnumProperty
    | apiJson.Ui5Aggregation
): model.UI5Meta {
  const meta: model.UI5Meta = {
    library: libName,
    description: jsonMeta.description,
    since: jsonMeta.since,
    deprecatedInfo: jsonMeta.deprecated
      ? {
          isDeprecated: true,
          since: jsonMeta.deprecated.since,
          text: jsonMeta.deprecated.text
        }
      : undefined,
    visibility: jsonMeta.visibility ?? "public"
  };
  return meta;
}

function convertSymbol(
  libName: string,
  jsonSymbol: apiJson.SymbolBase
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
  jsonConstructor: apiJson.ObjConstructor
): model.UI5Constructor {
  const constructor: model.UI5Constructor = {
    kind: "UI5Constructor",
    library: libName,
    description: jsonConstructor.description,
    visibility: jsonConstructor.visibility ?? "public",
    deprecatedInfo: undefined,
    since: undefined,
    name: "",
    parent: parent
  };
  return constructor;
}

function convertMethod(
  libName: string,
  parent: model.BaseUI5Node,
  jsonMethod: apiJson.ObjMethod
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
  jsonProperty: apiJson.ObjProperty
): model.UI5Field {
  const meta = convertMeta(libName, jsonProperty);
  const field: model.UI5Field = {
    kind: "UI5Field",
    ...meta,
    name: jsonProperty.name,
    parent: parent,
    type:
      jsonProperty.type === undefined
        ? undefined
        : {
            kind: "UnresolvedType",
            name: jsonProperty.type
          }
  };
  return field;
}

function convertProperty(
  libName: string,
  parent: model.BaseUI5Node,
  jsonProperty: apiJson.ObjProperty | apiJson.Ui5Property
): model.UI5Prop {
  const meta = convertMeta(libName, jsonProperty);
  const defaultValue = hasProperty(jsonProperty, "defaultValue")
    ? // We clone the value so the model will be standalone and won't reference the original library.
      // For most cases the defaultValue is a string or number so the clone won't do anything.
      cloneDeep(jsonProperty.defaultValue)
    : undefined;
  const property: model.UI5Prop = {
    kind: "UI5Prop",
    ...meta,
    name: jsonProperty.name,
    parent: parent,
    type:
      jsonProperty.type === undefined
        ? undefined
        : {
            kind: "UnresolvedType",
            name: jsonProperty.type
          },
    default: defaultValue
  };
  return property;
}

function convertEnumValue(
  libName: string,
  parent: model.UI5Enum,
  jsonProperty: apiJson.EnumProperty
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
  jsonAggregation: apiJson.Ui5Aggregation,
  parent: model.UI5Class
): model.UI5Aggregation {
  const meta = convertMeta(libName, jsonAggregation);
  const aggregation: model.UI5Aggregation = {
    kind: "UI5Aggregation",
    ...meta,
    name: jsonAggregation.name,
    parent: parent,
    type:
      jsonAggregation.type === undefined
        ? undefined
        : {
            kind: "UnresolvedType",
            name: jsonAggregation.type
          },
    altTypes: isArray(jsonAggregation.altTypes)
      ? map(jsonAggregation.altTypes, _ => ({
          kind: "UnresolvedType",
          name: _
        }))
      : [],
    cardinality: jsonAggregation.cardinality ?? "0..n"
  };
  return aggregation;
}

function convertAssociation(
  libName: string,
  jsonAssociation: apiJson.Ui5Association,
  parent: model.UI5Class
): model.UI5Association {
  const meta = convertMeta(libName, jsonAssociation);
  const association: model.UI5Association = {
    kind: "UI5Association",
    ...meta,
    name: jsonAssociation.name,
    parent: parent,
    type:
      jsonAssociation.type === undefined
        ? undefined
        : {
            kind: "UnresolvedType",
            name: jsonAssociation.type
          },
    cardinality: jsonAssociation.cardinality ?? "0..1"
  };
  return association;
}

function convertEvent(
  libName: string,
  parent: model.BaseUI5Node,
  jsonEvent: apiJson.Ui5Event | apiJson.ObjEvent
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

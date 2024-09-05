import {
  forEach,
  has,
  find,
  map,
  compact,
  pickBy,
  isArray,
  isPlainObject,
} from "lodash";

import {
  BaseUI5Node,
  PrimitiveTypeName,
  UI5Class,
  UI5ConstructorParameters,
  UI5Interface,
  UI5SemanticModel,
  UI5Type,
} from "@ui5-language-assistant/semantic-model-types";
import { TypeNameFix } from "../api";
import { SymbolBase, ClassSymbol, ObjCallableParameters } from "./api-json";
import { error, getParentFqn, findValueInMaps, findSymbol } from "./utils";
import { DEFAULT_UI5_FRAMEWORK } from "@ui5-language-assistant/constant";

// Exported for testing purpose
export function setParent(
  model: UI5SemanticModel,
  fqn: string,
  symbol: BaseUI5Node
): void {
  const parentFqn = getParentFqn(fqn, symbol.name);
  if (parentFqn !== undefined) {
    const parent = findSymbol(model, parentFqn);
    if (parent === undefined) {
      // Always throwing an error because we add these symbols implicitly so an error here means we have a bug
      error(
        `Symbol ${parentFqn} not found (should be parent of ${fqn}) [${
          model.framework || DEFAULT_UI5_FRAMEWORK
        }:${model.version}]`,
        true
      );
    }
    symbol.parent = parent;
  }
}

function resolveConstructorParameters(
  model: UI5SemanticModel,
  symbols: Record<string, SymbolBase>,
  typeNameFix: TypeNameFix,
  params: ObjCallableParameters = []
): UI5ConstructorParameters[] {
  const result: UI5ConstructorParameters[] = [];
  for (const param of params) {
    const type = resolveType({
      model,
      type: param.type,
      typeNameFix,
      strict: false,
    });
    if (type) {
      const data: UI5ConstructorParameters = {
        ...param,
        kind: "UI5TypedefProp",
        type,
        parameterProperties: [],
      };
      if (param.parameterProperties) {
        for (const key of Object.keys(param.parameterProperties)) {
          data.parameterProperties.push(
            ...resolveConstructorParameters(model, symbols, typeNameFix, [
              param.parameterProperties[key],
            ])
          );
        }
      }
      result.push(data);
    }
  }
  return result;
}

export function resolveSemanticProperties(
  model: UI5SemanticModel,
  symbols: Record<string, SymbolBase>,
  typeNameFix: TypeNameFix,
  strict: boolean
): void {
  const resolveTypePartial = (
    type: Parameters<typeof resolveType>[0]["type"],
    typedef?: boolean
  ): ReturnType<typeof resolveType> =>
    resolveType({ model, type, typeNameFix, strict, typedef });

  for (const key in model.classes) {
    const classs = model.classes[key];
    setParent(model, key, classs);
    const jsonSymbol = symbols[key] as ClassSymbol;
    if (jsonSymbol.extends !== undefined) {
      const extendsType = resolveTypePartial(jsonSymbol.extends);
      // Ignore undefined and object types since they don't provide any type information for extends
      if (
        extendsType !== undefined &&
        !(extendsType.kind === "PrimitiveType" && extendsType.name === "Object")
      ) {
        if (extendsType.kind !== "UI5Class") {
          error(
            `${jsonSymbol.extends} is a ${
              extendsType.kind
            } and not a class (class ${key} extends it) [${
              model.framework || DEFAULT_UI5_FRAMEWORK
            }:${model.version}]`,
            strict
          );
          continue;
        }
        classs.extends = extendsType;
      }
    }
    if (isArray(jsonSymbol.implements)) {
      for (const interfacee of jsonSymbol.implements) {
        const interfaceType = resolveTypePartial(interfacee);
        if (interfaceType !== undefined) {
          if (interfaceType.kind !== "UI5Interface") {
            error(
              `${interfacee} is a ${
                interfaceType.kind
              } and not an interface (class ${key} implements it) [${
                model.framework || DEFAULT_UI5_FRAMEWORK
              }:${model.version}]`,
              strict
            );
            continue;
          }
          classs.implements.push(interfaceType);
        }
      }
    }
    if (
      jsonSymbol["ui5-metadata"] !== undefined &&
      jsonSymbol["ui5-metadata"].defaultAggregation !== undefined
    ) {
      const defaultAggregation = jsonSymbol["ui5-metadata"].defaultAggregation;
      classs.defaultAggregation = find(
        classs.aggregations,
        (_) => _.name === defaultAggregation
      );
      if (classs.defaultAggregation === undefined) {
        error(
          `Unknown default aggregation ${defaultAggregation} in class ${key} [${
            model.framework || DEFAULT_UI5_FRAMEWORK
          }:${model.version}]`,
          strict
        );
      }
    }
    forEach(classs.properties, (_) => {
      _.type = resolveTypePartial(_.type);
    });
    forEach(classs.fields, (_) => {
      _.type = resolveTypePartial(_.type);
    });
    forEach(classs.aggregations, (_) => {
      _.type = resolveTypePartial(_.type);
      _.altTypes = compact(map(_.altTypes, (item) => resolveTypePartial(item)));
    });
    forEach(classs.associations, (_) => {
      _.type = resolveTypePartial(_.type);
    });

    const returnTypeNames = jsonSymbol["ui5-metadata"]?.["sap.fe"]?.returnTypes;
    if (returnTypeNames?.length) {
      const convertedTypes: (UI5Class | UI5Interface)[] = returnTypeNames
        .map(
          (typeName) => model.classes[typeName] || model.interfaces[typeName]
        )
        .filter((item) => !!item);
      classs.returnTypes = convertedTypes;
    }

    if (classs.ctor?.parameters && jsonSymbol.constructor?.parameters) {
      classs.ctor.parameters.push(
        ...resolveConstructorParameters(
          model,
          symbols,
          typeNameFix,
          jsonSymbol.constructor.parameters
        )
      );
    }
  }

  for (const key in model.enums) {
    const enumm = model.enums[key];
    setParent(model, key, enumm);
  }

  for (const key in model.namespaces) {
    const namespace = model.namespaces[key];
    setParent(model, key, namespace);
    forEach(namespace.fields, (_) => {
      _.type = resolveTypePartial(_.type);
    });
  }

  for (const key in model.interfaces) {
    const interfacee = model.interfaces[key];
    setParent(model, key, interfacee);
  }

  for (const key in model.typedefs) {
    const typedef = model.typedefs[key];
    setParent(model, key, typedef);
    forEach(typedef.properties, (_) => {
      (_.kind = "UI5TypedefProp"), (_.type = resolveTypePartial(_.type, true));
    });
  }

  for (const key in model.functions) {
    const func = model.functions[key];
    setParent(model, key, func);
  }

  // This should be called after all of the setParent calls
  for (const key in model.namespaces) {
    const namespace = model.namespaces[key];
    namespace.namespaces = pickBy(
      model.namespaces,
      (_) => _.parent === namespace
    );
    namespace.classes = pickBy(model.classes, (_) => _.parent === namespace);
  }
}

function fixTypeName(
  fqn: string | undefined,
  typeNameFix: TypeNameFix
): string | undefined {
  if (fqn === undefined || ignoreType(fqn)) {
    return undefined;
  }
  if (has(typeNameFix, fqn)) {
    return typeNameFix[fqn];
  }
  return fqn;
}
const noUndefined = <T extends UI5Type>(type: T | undefined): type is T =>
  type !== undefined;

const collectUnionType = ({
  model,
  type,
  typeNameFix,
  strict,
  collection,
  typedef,
}: {
  model: UI5SemanticModel;
  type: string;
  typeNameFix: TypeNameFix;
  strict: boolean;
  collection: boolean;
  typedef?: boolean;
}): UI5Type => {
  const innerType = type
    .split("|")
    .map((i) =>
      resolveType({
        model,
        type: collection ? `${i}[]` : i,
        typeNameFix,
        strict,
        typedef,
      })
    )
    .filter(noUndefined);
  return {
    kind: "UnionType",
    types: innerType,
  };
};

// Exported for testing purpose
export function resolveType({
  model,
  type,
  typeNameFix,
  strict,
  typedef,
}: {
  model: UI5SemanticModel;
  type: UI5Type | string | undefined;
  typeNameFix: TypeNameFix;
  strict: boolean;
  typedef?: boolean;
}): UI5Type | undefined {
  // String types are unresolved
  if (typeof type === "string") {
    if (type.startsWith("Object<")) {
      type = "Object";
    }
    type = {
      kind: "UnresolvedType",
      name: type,
    };
  }

  // Invalid type - this can only happen if the schema validation failed and we're in non-strict mode
  if (!isPlainObject(type)) {
    return undefined;
  }

  // Before resolving all types are UnresolvedType or undefined
  if (type === undefined || type.kind !== "UnresolvedType") {
    return type;
  }
  /**
   * JSDoc uses usually `|` to represent union type, but
   * starting with UI5 version 1.121.1, it may use `,`. For instance aggregation actions of `sap.fe.macros.Table` is represented by "sap.fe.macros.table.Action,sap.fe.macros.table.ActionGroup"
   * Todo: Alignment on union type representation is required.
   */
  if (Array.isArray(type.name)) {
    const types: UI5Type[] = [];
    for (const t of type.name) {
      const resolvedType = resolveType({
        model,
        type: t,
        typeNameFix,
        strict,
        typedef,
      });
      if (!resolvedType) {
        continue;
      }
      types.push(resolvedType);
    }
    return {
      kind: "UnionType",
      types,
    };
  }

  const typeName = fixTypeName(type.name, typeNameFix);
  if (typeName === undefined) {
    return undefined;
  }
  if (typeName === "any") {
    return {
      kind: "UI5Any",
      name: "any",
    };
  }
  const typeObj = findValueInMaps<UI5Type>(
    typeName,
    model.classes,
    model.interfaces,
    model.enums,
    model.namespaces,
    model.typedefs
  );
  if (typeObj !== undefined) {
    return typeObj;
  }

  const primitiveTypeName = getPrimitiveTypeName(typeName);
  if (primitiveTypeName !== undefined) {
    return {
      kind: "PrimitiveType",
      name: primitiveTypeName,
    };
  }

  if (typeName.startsWith("Array<(")) {
    const innerTypeName = typeName.slice(
      typeName.indexOf("(") + 1,
      typeName.indexOf(")")
    );
    if (innerTypeName.indexOf("|") !== -1) {
      return collectUnionType({
        model,
        type: innerTypeName,
        typeNameFix,
        strict,
        collection: true,
        typedef,
      });
    }
    const innerType = resolveType({
      model,
      type: innerTypeName,
      typeNameFix,
      strict,
      typedef,
    });
    return {
      kind: "ArrayType",
      type: innerType,
    };
  } else if (typeName.endsWith("[]")) {
    if (typeName.indexOf("|") !== -1) {
      return collectUnionType({
        model,
        type: typeName,
        typeNameFix,
        strict,
        collection: false,
        typedef,
      });
    }
    const innerTypeName = typeName.substring(0, typeName.length - "[]".length);
    const innerType = resolveType({
      model,
      type: innerTypeName,
      typeNameFix,
      strict,
      typedef,
    });
    return {
      kind: "ArrayType",
      type: innerType,
    };
  } else if (typeName.indexOf("|") !== -1) {
    return collectUnionType({
      model,
      type: typeName,
      typeNameFix,
      strict,
      collection: false,
      typedef,
    });
  } else if (typeName.indexOf("function") !== -1) {
    const t = typeName.slice(typeName.indexOf("function"), "function".length);
    return resolveType({
      model,
      type: t,
      strict,
      typeNameFix,
      typedef,
    });
  } else {
    error(
      `Unknown type: ${typeName} [${model.framework || DEFAULT_UI5_FRAMEWORK}:${
        model.version
      }]`,
      strict && !typedef
    );
    return {
      kind: "UnresolvedType",
      name: typeName,
    };
  }
}

const apiJsonTypeToModelType: Record<string, PrimitiveTypeName> = {
  string: "String",
  boolean: "Boolean",
  number: "Number",
  int: "Integer",
  float: "Float",
  String: "String",
  Object: "Object",
  object: "Object",
  map: "Map",
  function: "Function",
};

function getPrimitiveTypeName(typeName: string): PrimitiveTypeName | undefined {
  return apiJsonTypeToModelType[typeName]; // function(string,sap.ui.model.Context) : sap.ui.base.ManagedObject
}

// These types don't have any specific type information
const typesToIgnore: Record<string, undefined> = {
  undefined: undefined,
};
function ignoreType(typeName: string): boolean {
  return has(typesToIgnore, typeName);
}

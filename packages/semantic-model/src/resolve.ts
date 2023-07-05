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
  UI5Interface,
  UI5SemanticModel,
  UI5Type,
} from "@ui5-language-assistant/semantic-model-types";
import { TypeNameFix } from "../api";
import { SymbolBase, ClassSymbol, Ui5Property } from "./api-json";
import { error, getParentFqn, findValueInMaps, findSymbol } from "./utils";

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
          model.framework || "SAPUI5"
        }:${model.version}]`,
        true
      );
    }
    symbol.parent = parent;
  }
}

export function resolveSemanticProperties(
  model: UI5SemanticModel,
  symbols: Record<string, SymbolBase>,
  typeNameFix: TypeNameFix,
  strict: boolean
): void {
  const resolveTypePartial = (
    type: Parameters<typeof resolveType>[0]["type"]
  ): ReturnType<typeof resolveType> =>
    resolveType({ model, type, typeNameFix, strict });

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
              model.framework || "SAPUI5"
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
                model.framework || "SAPUI5"
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
            model.framework || "SAPUI5"
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
      _.altTypes = compact(map(_.altTypes, resolveTypePartial));
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

// Exported for testing purpose
export function resolveType({
  model,
  type,
  typeNameFix,
  strict,
}: {
  model: UI5SemanticModel;
  type: UI5Type | string | undefined;
  typeNameFix: TypeNameFix;
  strict: boolean;
}): UI5Type | undefined {
  // String types are unresolved
  if (typeof type === "string") {
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

  const typeName = fixTypeName(type.name, typeNameFix);
  if (typeName === undefined) {
    return undefined;
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
  if (typeName.endsWith("[]")) {
    const innerTypeName = typeName.substring(0, typeName.length - "[]".length);
    const innerType = resolveType({
      model,
      type: innerTypeName,
      typeNameFix,
      strict,
    });
    return {
      kind: "ArrayType",
      type: innerType,
    };
  } else {
    error(
      `Unknown type: ${typeName} [${model.framework || "SAPUI5"}:${
        model.version
      }]`,
      strict
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
  return apiJsonTypeToModelType[typeName];
}

// These types don't have any specific type information
const typesToIgnore: Record<string, undefined> = {
  undefined: undefined,
  any: undefined,
};
function ignoreType(typeName: string): boolean {
  return has(typesToIgnore, typeName);
}

export function resolveTypeDefPropertyType(
  model: UI5SemanticModel,
  prop: Ui5Property
): UI5Type {
  const { type = "" } = prop;
  const primitiveTypeName = getPrimitiveTypeName(type);
  if (primitiveTypeName !== undefined) {
    return {
      kind: "PrimitiveType",
      name: primitiveTypeName,
    };
  }
  if (type.startsWith("Object<")) {
    return {
      kind: "PrimitiveType",
      name: "Object",
    };
  }
  if (type.startsWith("Array<(")) {
    const t = type.slice(type.indexOf("(") + 1, type.indexOf(")"));
    if (t.indexOf("|") !== -1) {
      const types = t.split("|").map((i) => {
        return resolveTypeDefPropertyType(model, { ...prop, type: i.trim() });
      });
      return {
        kind: "UnionType",
        collection: true,
        types,
      };
    }

    return resolveTypeDefPropertyType(model, { ...prop, type: t });
  }
  if (type.endsWith("[]")) {
    const t = type.slice(0, type.indexOf("[", -1));
    if (t.indexOf("|") !== -1) {
      const types = t.split("|").map((i) => {
        return resolveTypeDefPropertyType(model, { ...prop, type: i.trim() });
      });
      return {
        kind: "UnionType",
        collection: true,
        types,
      };
    }

    return resolveTypeDefPropertyType(model, { ...prop, type: t });
  }
  if (type.indexOf("|") !== -1) {
    const types = type.split("|").map((i) => {
      return resolveTypeDefPropertyType(model, { ...prop, type: i.trim() });
    });
    return {
      kind: "UnionType",
      collection: false,
      types,
    };
  }
  // check class
  if (model.classes[type]) {
    return {
      ...model.classes[type],
      kind: "UI5Class",
    };
  }
  // check enum
  if (model.enums[type]) {
    return {
      ...model.enums[type],
      kind: "UI5Enum",
    };
  }
  // check typdefs
  if (model.typedefs[type]) {
    return {
      ...model.typedefs[type],
      kind: "UI5Typedef",
    };
  }
  return {
    kind: "UnresolvedType",
    name: `${type}`,
  };
}
